<?php

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    require_once 'db.php';
    require_once 'validate.php';

    $conn = db::getDbConnection();
    $ids = json_decode( file_get_contents("php://input") );

    if ( Validate::validateIDs($ids) ) {
        $sql = "DELETE FROM customers WHERE cId IN (";

        for ($i = 0; $i < count($ids); $i++) {
            if ( $i < (count($ids) - 1) ) $sql .= $ids[$i] . ", ";
            else $sql .= $ids[$i] . ")";
        }

        try {
            $conn->exec($sql);
            echo json_encode("Record(s) deleted successfully.");
        }
        catch(PDOException $e) {
            echo json_encode( $e->getMessage() );
        }
    }
    else {
        echo json_encode("Invalid ID(s)!");
    }

    $conn = null;
}