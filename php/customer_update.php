<?php

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    require_once 'db.php';
    require_once 'validate.php';

    $conn = db::getDbConnection();
    $data = json_decode( file_get_contents("php://input") );
    $response = new stdClass;

    $validID = Validate::validateID($data->id);
    $validValue = true;

    switch ($data->column) {
        case "title" :
            $validValue = empty($data->value) ? true : Validate::validateTitle($data->value);
            break;
        case "fname" :
            $validValue = Validate::validateName($data->value);
            break;
        case "lname" :
            $validValue = empty($data->value) ? true : Validate::validateName($data->value);
            break;
        case "email" :
            $validValue = empty($data->value) ? true : Validate::validateEmail($data->value);
            break;
        case "parish" :
            $validValue = empty($data->value) ? true : Validate::validateParish($data->value);
            break;
        case "address" :
            $data->value = db::escapeString($data->value);
            break;
        case "homeNo" :
        case "cellNo" :
            $validValue = empty($data->value) ? true : Validate::validateTel($data->value);
            break;
        case "otherNos" :
            $validValue = empty($data->value) ? true : Validate::validateMultTel($data->value);
            break;
        default :
            $validValue = false;
    }

    if ($validID && $validValue) {
        try {
            $conn->exec("UPDATE customers SET $data->column = '$data->value' WHERE cId = $data->id");

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
    $conn = null;
}