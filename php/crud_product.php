<?php

if ($_SERVER["REQUEST_METHOD"] !== "POST") die("No direct script access allowed!");

require_once 'database.php';

$conn = DB::getDbConnection();
$req = json_decode( file_get_contents("php://input") );

$product = new stdClass;
$response = new stdClass;

switch ($req->action) {
    case "READ_ALL" :
        // Almost equivalent to PHP's htmlspecialchars_decode()
        $desc = "REPLACE( REPLACE( REPLACE( REPLACE(`desc`, '&amp;', '&'), '&quot;', '\"'), '&lt;', '<'), '&gt;', '>')";
        
        $rows = $conn->query("SELECT name, $desc, image, unit, unitPrice FROM products LIMIT 25");
        $rows = $rows->fetchAll(PDO::FETCH_ASSOC);

        $rowIds = $conn->query("SELECT pId FROM products LIMIT 25");
        $rowIds = $rowIds->fetchAll(PDO::FETCH_ASSOC);

        $numRows = $conn->query("SELECT COUNT(pId) FROM products");
        $numRows = $numRows->fetchAll(PDO::FETCH_ASSOC);

        $product->rows = $rows;
        $product->rowIds = $rowIds;
        $product->numRows = (int)$numRows[0]["COUNT(pId)"];

        echo json_encode($product);
        break;
    case "READ" :
        $desc = "REPLACE( REPLACE( REPLACE( REPLACE(`desc`, '&amp;', '&'), '&quot;', '\"'), '&lt;', '<'), '&gt;', '>')";

        $rowsSQL = "SELECT name, $desc, image, unit, unitPrice FROM products";
        $rowIdsSQL = "SELECT pId FROM products";
        $numRowsSQL = "SELECT COUNT(pId) FROM products";

        $limit = DB::sanitizeLimit($req->payload->limit);
        $offset = DB::sanitizeOffset($req->payload->offset);

        $r_ri = ""; // for rows & row Ids
        $nr = ""; // For num rows

        if (count($req->payload->filters) > 0) {
            $filtersArr = DB::sanitizeFilters($req->payload->filters);
            $filtersSQL = "";

            foreach ($filtersArr as $i => $obj) {
                if ($obj->operator) {
                    $filtersSQL .= $obj->operator . " ";
                }

                $filtersSQL .= "(" . $obj->column . " ";
                
                if ($obj->operation === "contain") {
                    $filtersSQL .= "LIKE '%" . $obj->filterValue . "%'";
                }
                elseif ($obj->operation === "startWith") {
                    $filtersSQL .= "LIKE '" . $obj->filterValue . "%'";
                }
                elseif ($obj->operation === "endWith") {
                    $filtersSQL .= "LIKE '%" . $obj->filterValue . "'";
                }
                elseif ($obj->operation === "isEmpty") {
                    $filtersSQL .= "IS NULL OR " . $obj->column . " = ''";
                }
                elseif ($obj->operation === "isNotEmpty") {
                    $filtersSQL .= "IS NOT NULL AND " . $obj->column . " != ''";
                }
                else {
                    $filtersSQL .= $obj->operation . " '" . $obj->filterValue . "'";
                }

                $filtersSQL .= ") ";
            }

            $r_ri .= " WHERE " . $filtersSQL;
            $nr .= " WHERE " . $filtersSQL;
        }

        if (count($req->payload->sorts) > 0) {
            $sortsArr = DB::sanitizeSorts($req->payload->sorts);
            $sortsSQL = "";

            for ($i = 0; $i < count($sortsArr); $i++) {
                $sortsSQL .= $sortsArr[$i]->column . " " . $sortsArr[$i]->direction;

                if ($i < (count($sortsArr) - 1) ) $sortsSQL .= ", ";
            }

            $r_ri .= " ORDER BY " . $sortsSQL;
        }
        
        $rows = $conn->query($rowsSQL . $r_ri . " LIMIT " . $offset . ", " . $limit);
        $rows = $rows->fetchAll(PDO::FETCH_ASSOC);

        $rowIds = $conn->query($rowIdsSQL . $r_ri . " LIMIT " . $offset . ", " . $limit);
        $rowIds = $rowIds->fetchAll(PDO::FETCH_ASSOC);

        $numRows = $conn->query($numRowsSQL . $nr);
        $numRows = $numRows->fetchAll(PDO::FETCH_ASSOC);

        $product->rows = $rows;
        $product->rowIds = $rowIds;
        $product->numRows = (int)$numRows[0]["COUNT(pId)"];

        echo json_encode($product);
        break;
    case "CREATE" :
        $name = ucwords($req->payload->name);
        $desc = DB::escapeString($req->payload->desc);
        $image = $req->payload->image;
        $unit = $req->payload->unit;
        $unitPrice = $req->payload->unitPrice;

        $valid['name'] = Validate::Name($name);
        $valid['image'] = empty($image) ? true : Validate::Image($image);
        $valid['unit'] = Validate::Unit($unit);
        $valid['unitPrice'] = Validate::UnitPrice($unitPrice);
        $unitPrice = Format::UnitPrice($unitPrice);

        if ( !array_search(false, $valid, true) ) {
            try {
                $conn->exec("INSERT INTO products VALUES (NULL, '$name', '$desc', '$image', '$unit', '$unitPrice', NULL, NULL)");

                $response->success = true;
                $response->message = "New record added successfully.";
            }
            catch(PDOException $e) {
                $response->success = false;
                $response->message = $e->getMessage();
            }
        }
        else {
            $response->success = false;
            $response->message = $valid;
        }
        
        echo json_encode($response);
        break;
    case "DELETE" :
        $ids = $req->payload;

        if ( Validate::IDs($ids) ) {
            $sql = "DELETE FROM products WHERE pId IN (";
    
            for ($i = 0; $i < count($ids); $i++) {
                if ( $i < (count($ids) - 1) ) $sql .= $ids[$i] . ", ";
                else $sql .= $ids[$i] . ")";
            }
    
            try {
                $conn->exec($sql);
                $response->success = true;
                $response->message = "Record(s) deleted successfully.";
            }
            catch(PDOException $e) {
                $response->success = false;
                $response->message = $e->getMessage();
            }
        }
        else {
            $response->success = false;
            $response->message = "Invalid ID(s)!";
        }
        
        echo json_encode($response);
        break;
    case "UPDATE" :
        $id = $req->payload->id;
        $column = $req->payload->column;
        $value = $req->payload->value;

        $validID = Validate::ID($id);
        $validValue = true;
    
        switch ($column) {
            case "name" :
                $validValue = Validate::Name($value);
                break;
            case "desc" :
                $value = DB::escapeString($value);
                break;
            case "image" :
                $validValue = empty($value) ? true : Validate::Image($value);
                break;
            case "unit" :
                $validValue = Validate::Unit($value);
                break;
            case "unitPrice" :
                $validValue = Validate::UnitPrice($value);
                $value = Format::UnitPrice($value);
                break;
            default :
                $validValue = false;
        }
    
        if ($validID && $validValue) {
            try {
                $conn->exec("UPDATE products SET `$column` = '$value' WHERE pId = $id");
    
                $response->success = true;
                $response->message = "Column updated successfully.";
            }
            catch(PDOException $e) {
                $response->success = false;
                $response->message = $e->getMessage();
            }
        }
        else {
            $response->success = false;
            $response->message = "Invalid column data";
        }
    
        echo json_encode($response);
        break;
    default :
        echo json_encode("Action '$req->action' not recognized");
}

$conn = null;