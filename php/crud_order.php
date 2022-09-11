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
    // TODO
    case "READ_ALL": {
        echo json_encode($_POST["REQUEST_ACTION"]);
        break;
    }
    // TODO
    case "READ": {
        echo json_encode($_POST["REQUEST_ACTION"]);
        break;
    }
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
    // TODO
    case "DELETE": {
        echo json_encode($_POST["REQUEST_ACTION"]);
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