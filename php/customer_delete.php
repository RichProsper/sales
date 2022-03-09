<?php

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    require_once 'db.php';
    require_once 'validate.php';

    $conn = db::getDbConnection();
    $ids = json_decode( file_get_contents("php://input") );
    $response = new stdClass;

    if ( Validate::validateIDs($ids) ) {
        $sql = "DELETE FROM customers WHERE cId IN (";

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
    $conn = null;
}