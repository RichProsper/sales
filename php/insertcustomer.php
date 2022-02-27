<?php

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    require_once 'db.php';
    require_once 'validate.php';

    $conn = db::getDbConnection();
    $data = json_decode( file_get_contents("php://input") );

    $valid['title'] = empty($data->title) ? true : Validate::validateTitle($data->title);
    $valid['fname'] = Validate::validateName($data->fname);
    $valid['lname'] = empty($data->lname) ? true : Validate::validateName($data->lname);
    $valid['email'] = empty($data->email) ? true : Validate::validateEmail($data->email);
    $valid['parish'] = empty($data->parish) ? true : Validate::validateParish($data->parish);
    $address = htmlspecialchars( stripslashes( trim($data->address) ) );
    $valid['homeNo'] = empty($data->homeNo) ? true : Validate::validateTel($data->homeNo);
    $valid['cellNo'] = empty($data->cellNo) ? true : Validate::validateTel($data->cellNo);
    $valid['otherNos'] = empty($data->otherNos) ? true : Validate::validateMultTel($data->otherNos);

    if ( !array_search(false, $valid, true) ) {
        try {
            $conn->exec("INSERT INTO customers VALUES (NULL, '$data->title', '$data->fname', '$data->lname', '$data->email', '$data->parish', '$address', '$data->homeNo', '$data->cellNo', '$data->otherNos', NULL, NULL)");

            echo json_encode("New record added successfully");
        }
        catch(PDOException $e) {
            echo json_encode( $e->getMessage() );
        }
    }
    else {
        echo json_encode($valid);
    }
    
    $conn = null;
}