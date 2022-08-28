<?php

if ($_SERVER["REQUEST_METHOD"] !== "POST") die("No direct script access allowed!");

require_once 'database.php';

$conn = DB::getDbConnection();

$order = new stdClass;
$response = new stdClass;

switch ($_POST["REQUEST_ACTION"]) {
    case "READ_ALL": {
        // Almost equivalent to PHP's htmlspecialchars_decode()
        $comments = "REPLACE( REPLACE( REPLACE( REPLACE(comments, '&amp;', '&'), '&quot;', '\"'), '&lt;', '<'), '&gt;', '>')";
        
        $rows = $conn->query("SELECT title, fname, lname, email, parish, $comments, homeNo, cellNo, otherNos FROM customers LIMIT 25");
        $rows = $rows->fetchAll(PDO::FETCH_ASSOC);

        $rowIds = $conn->query("SELECT cId FROM customers LIMIT 25");
        $rowIds = $rowIds->fetchAll(PDO::FETCH_ASSOC);

        $numRows = $conn->query("SELECT COUNT(cId) FROM customers");
        $numRows = $numRows->fetchAll(PDO::FETCH_ASSOC);

        $customer->rows = $rows;
        $customer->rowIds = $rowIds;
        $customer->numRows = (int)$numRows[0]["COUNT(cId)"];

        echo json_encode($customer);
        break;
    }
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