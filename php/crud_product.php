<?php

if ($_SERVER["REQUEST_METHOD"] !== "POST") die("No direct script access allowed!");

require_once 'database.php';

$conn = DB::getDbConnection();

$product = new stdClass;
$response = new stdClass;

switch ($_POST["REQUEST_ACTION"]) {
    case "READ_ALL": {
        // Almost equivalent to PHP's htmlspecialchars_decode()
        $desc = "REPLACE( REPLACE( REPLACE( REPLACE(`desc`, '&amp;', '&'), '&quot;', '\"'), '&lt;', '<'), '&gt;', '>')";
        
        $rows = $conn->query("SELECT name, $desc, image, unit, unitPrice FROM products WHERE isDeleted = 'No' LIMIT 25");
        $rows = $rows->fetchAll(PDO::FETCH_ASSOC);

        $rowIds = $conn->query("SELECT pId FROM products WHERE isDeleted = 'No' LIMIT 25");
        $rowIds = $rowIds->fetchAll(PDO::FETCH_ASSOC);

        $numRows = $conn->query("SELECT COUNT(pId) FROM products WHERE isDeleted = 'No'");
        $numRows = $numRows->fetchAll(PDO::FETCH_ASSOC);

        $product->rows = $rows;
        $product->rowIds = $rowIds;
        $product->numRows = (int)$numRows[0]["COUNT(pId)"];

        echo json_encode($product);
        break;
    }
    case "READ": {
        $filters = json_decode($_POST["filters"]);
        $sorts = json_decode($_POST["sorts"]);

        $desc = "REPLACE( REPLACE( REPLACE( REPLACE(`desc`, '&amp;', '&'), '&quot;', '\"'), '&lt;', '<'), '&gt;', '>')";

        $rowsSQL = "SELECT name, $desc, image, unit, unitPrice FROM products WHERE (`isDeleted` = 'No')";
        $rowIdsSQL = "SELECT pId FROM products WHERE (`isDeleted` = 'No')";
        $numRowsSQL = "SELECT COUNT(pId) FROM products WHERE (`isDeleted` = 'No')";

        $limit = DB::sanitizeLimit( intval($_POST["limit"]) );
        $offset = DB::sanitizeOffset( intval($_POST["offset"]) );

        $r_ri = ""; // for rows & row Ids
        $nr = ""; // For num rows

        if (count($filters) > 0) {
            $filtersArr = DB::sanitizeFilters($filters);
            $filtersSQL = "";

            foreach ($filtersArr as $i => $obj) {
                if ($obj->operator) {
                    $filtersSQL .= $obj->operator . " ";
                }

                $filtersSQL .= "(`" . $obj->column . "` ";
                
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
                    $filtersSQL .= "IS NULL OR `" . $obj->column . "` = ''";
                }
                elseif ($obj->operation === "isNotEmpty") {
                    $filtersSQL .= "IS NOT NULL AND `" . $obj->column . "` != ''";
                }
                else {
                    $filtersSQL .= $obj->operation . " '" . $obj->filterValue . "'";
                }

                $filtersSQL .= ") ";
            }

            $r_ri .= " AND (" . $filtersSQL . ")";
            $nr .= " AND (" . $filtersSQL . ")";
        }

        if (count($sorts) > 0) {
            $sortsArr = DB::sanitizeSorts($sorts);
            $sortsSQL = "";

            for ($i = 0; $i < count($sortsArr); $i++) {
                $sortsSQL .= "`" . $sortsArr[$i]->column . "` " . $sortsArr[$i]->direction;

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
    } // case "READ"
    case "CREATE": {
        $name = ucwords($_POST["name"]);
        $desc = DB::escapeString($_POST["desc"]);
        $image = "";
        $unit = $_POST["unit"];
        $unitPrice = $_POST["unitPrice"];

        $valid["name"] = Validate::Name($name);
        $valid["image"] = Validate::Image($_FILES["image"]);
        $valid["unit"] = Validate::Unit($unit);
        $valid["unitPrice"] = Validate::UnitPrice($unitPrice);
        $unitPrice = Format::UnitPrice($unitPrice);

        if ( !array_search(false, $valid, true) ) {
            if (!empty($_FILES["image"]["tmp_name"])) {
                $arr = explode(".", basename($_FILES["image"]["name"]));
                $ext = $arr[count($arr) - 1];
                $imageName = date("Ymd-His") . "." . $ext;
                $image = "uploads/" . $imageName;

                if ( !move_uploaded_file($_FILES["image"]["tmp_name"], $image) ) {
                    $response->success = false;
                    $response->message = "Error uploading file";
                    break;
                }

                // ! Important
                $image = "php/" . $image;
            }

            try {
                $conn->exec("INSERT INTO products VALUES (NULL, '$name', '$desc', '$image', '$unit', '$unitPrice', NULL, NULL, 'No', NULL)");

                $response->success = true;
                $response->message = "New product added successfully.";
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
    }
    case "DELETE": {
        $ids = json_decode($_POST["ids"]);

        if ( Validate::IDs($ids) ) {
            $idsSql = "";
    
            for ($i = 0; $i < count($ids); $i++) {
                if ( $i < (count($ids) - 1) ) $idsSql .= $ids[$i] . ", ";
                else $idsSql .= $ids[$i] . ")";
            }

            try {
                $conn->exec("UPDATE products SET `isDeleted` = 'Yes' WHERE pId IN (" . $idsSql);
                $response->success = true;
                $response->message = "Product(s) deleted successfully.";
            }
            catch (PDOException $e) {
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
    }
    case "UPDATE": {
        $id = intval($_POST["id"]);
        $column = $_POST["column"];
        $value = $_POST["value"];

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
                $validValue = Validate::Image($_FILES["image"]);
                $value = "";
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
            // Deletes the corresponding image file
            try {
                $row = $conn->query("SELECT image FROM `products` WHERE pId = $id");
                $row = $row->fetch(PDO::FETCH_ASSOC);

                if ($row["image"]) {
                    $file = explode("php/", $row["image"])[1];
                    if (file_exists($file)) unlink($file);
                }
            }
            catch (PDOException $e) {
                $response->success = false;
                $response->message = $e->getMessage();
                break;
            }

            // Upload the new image file if one exists
            if ($column === "image" && !empty($_FILES["image"]["tmp_name"])) {
                $arr = explode(".", basename($_FILES["image"]["name"]));
                $ext = $arr[count($arr) - 1];
                $imageName = date("Ymd-His") . "." . $ext;
                $image = "uploads/" . $imageName;

                if ( !move_uploaded_file($_FILES["image"]["tmp_name"], $image) ) {
                    $response->success = false;
                    $response->message = "Error uploading file";
                    break;
                }

                // ! Important
                $value = "php/" . $image;
            }

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
    } // case "UPDATE"
    default: {
        $req_action = $_POST["REQUEST_ACTION"];
        echo json_encode("Action '$req_action' not recognized");
    }
}

$conn = null;