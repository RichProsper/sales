<?php

if ($_SERVER["REQUEST_METHOD"] !== "POST") die("No direct script access allowed!");

require_once 'database.php';

$conn = DB::getDbConnection();

$order = new stdClass;
$response = new stdClass;

switch ($_POST["REQUEST_ACTION"]) {
    case "CUSTOMER_READ_ALL": {                
        $rows = $conn->query("SELECT cId, title, fname, lname FROM customers WHERE isDeleted = 'No' ORDER BY fname, lname");
        $rows = $rows->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rows);
        break;
    }
    case "PRODUCT_READ_ALL": {
        $rows = $conn->query("SELECT pId, name, unit, unitPrice FROM products WHERE isDeleted = 'No' ORDER BY name");
        $rows = $rows->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rows);
        break;
    }
    case "READ_ALL": {
        $rows = $conn->query("SELECT orders.cId, fname, lname, genStatus, delStatus, pmtStatus, comments, orders.createdAt FROM orders, customers WHERE orders.cId = customers.cId AND orders.isDeleted = 'No' LIMIT 25");
        $rows = $rows->fetchAll(PDO::FETCH_ASSOC);

        $rowIds = $conn->query("SELECT oId FROM orders WHERE isDeleted = 'No' LIMIT 25");
        $rowIds = $rowIds->fetchAll(PDO::FETCH_ASSOC);

        $numRows = $conn->query("SELECT COUNT(oId) FROM orders WHERE isDeleted = 'No'");
        $numRows = $numRows->fetchAll(PDO::FETCH_ASSOC);

        $order->rows = $rows;
        $order->rowIds = $rowIds;
        $order->numRows = (int)$numRows[0]["COUNT(oId)"];

        echo json_encode($order);
        break;
    }
    case "READ": {
        $filters = json_decode($_POST["filters"]);
        $sorts = json_decode($_POST["sorts"]);

        $rowsSQL = "SELECT orders.cId, fname, lname, genStatus, delStatus, pmtStatus, comments, orders.createdAt FROM orders, customers WHERE (orders.cId = customers.cId AND orders.isDeleted = 'No')";
        $rowIdsSQL = "SELECT oId FROM orders, customers WHERE (orders.cId = customers.cId AND orders.isDeleted = 'No')";
        $numRowsSQL = "SELECT COUNT(oId) FROM orders, customers WHERE (orders.cId = customers.cId AND orders.isDeleted = 'No')";

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

            $r_ri .= " AND (" . $filtersSQL . ")";
            $nr .= " AND (" . $filtersSQL . ")";
        }

        if (count($sorts) > 0) {
            $sortsArr = DB::sanitizeSorts($sorts);
            $sortsSQL = "";

            for ($i = 0; $i < count($sortsArr); $i++) {
                $sortsSQL .= "" . $sortsArr[$i]->column . " " . $sortsArr[$i]->direction;

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

        $order->rows = $rows;
        $order->rowIds = $rowIds;
        $order->numRows = (int)$numRows[0]["COUNT(oId)"];

        echo json_encode($order);
        break;
    } // case "READ"
    case "CREATE": {
        $order = json_decode($_POST["order"]);
        $cId = $order->cId;
        
        $valid["cId"] = Validate::ID($cId);
        $valid["pIds"] = Validate::IDs($order->pIds);
        $valid["quantities"] = Validate::Quantities($order->quantities);
        
        if ( !array_search(false, $valid, true) ) {
            try {
                $conn->exec("INSERT INTO orders VALUES (NULL, '$cId', 'Not Completed', 'Not Delivered', 'Not Paid', NULL, NULL, NULL, 'No', NULL)");

                $oId = $conn->query("SELECT MAX(oId) FROM orders");
                $oId = $oId->fetchAll(PDO::FETCH_ASSOC);
                $oId = $oId[0]["MAX(oId)"];

                $order->quantities = Format::Quantities($order->quantities);
                
                foreach ($order->quantities as $i => $quantity) {
                    $pId = $order->pIds[$i];
                    $conn->exec("INSERT INTO orderproducts VALUES (NULL, '$oId', '$pId', '$quantity')");
                }

                $response->success = true;
                $response->message = "New order added successfully.";
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
            $sql = "UPDATE orders SET `isDeleted` = 'Yes' WHERE oId IN (";
    
            for ($i = 0; $i < count($ids); $i++) {
                if ( $i < (count($ids) - 1) ) $sql .= $ids[$i] . ", ";
                else $sql .= $ids[$i] . ")";
            }
    
            try {
                $conn->exec($sql);
                $response->success = true;
                $response->message = "Order(s) deleted successfully.";
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
    }
    // TODO
    case "UPDATE": {
        echo json_encode($_POST["REQUEST_ACTION"]);
        break;
    }
    default: {
        $req_action = $_POST["REQUEST_ACTION"];
        echo json_encode("Action '$req_action' not recognized");
    }
}

$conn = null;