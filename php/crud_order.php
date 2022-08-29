<?php

if ($_SERVER["REQUEST_METHOD"] !== "POST") die("No direct script access allowed!");

require_once 'database.php';

$conn = DB::getDbConnection();

$order = new stdClass;
$response = new stdClass;

switch ($_POST["REQUEST_ACTION"]) {
    case "CUSTOMER_READ_ALL": {                
        $rows = $conn->query("SELECT cId, title, fname, lname FROM customers WHERE isDeleted = 'No' ");
        $rows = $rows->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rows);
        break;
    }
    case "PRODUCT_READ_ALL": {
        $rows = $conn->query("SELECT pId, name, unit FROM products WHERE isDeleted = 'No'");
        $rows = $rows->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rows);
        break;
    }
    case "READ_ALL": {}
    case "READ": {}
    case "CREATE": {}
    case "DELETE": {}
    case "UPDATE": {}
    default: {
        $req_action = $_POST["REQUEST_ACTION"];
        echo json_encode("Action '$req_action' not recognized");
    }
}

$conn = null;