<?php
    require_once 'db.php';
    $conn = db::getDbConnection();

    if ($_SERVER["REQUEST_METHOD"] === "GET") {
        $sql = "SELECT title, fname, lname, email, parish, address, homeNo, cellNo, otherNos FROM customers LIMIT 25";
        $customers = $conn->query($sql);
        $customers = $customers->fetchAll(PDO::FETCH_ASSOC);

        $sql = "SELECT COUNT(cId) FROM customers";
        $numRows = $conn->query($sql);
        $numRows = $numRows->fetchAll(PDO::FETCH_ASSOC);
        
        $customer = new stdClass;
        $customer->rows = $customers;
        $customer->numRows = (int)$numRows[0]["COUNT(cId)"];
        echo json_encode($customer);
    }
    else if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $rules = json_decode( file_get_contents("php://input") );

        $stmt = $conn->prepare("SELECT title, fname, lname, email, parish, address, homeNo, cellNo, otherNos FROM customers LIMIT :offset, :limit");
        $stmt->bindParam(':limit', $rules->limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $rules->offset, PDO::PARAM_INT);
        $stmt->execute();
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $rows = $stmt->fetchAll();

        $sql = "SELECT COUNT(cId) FROM customers";
        $numRows = $conn->query($sql);
        $numRows = $numRows->fetchAll(PDO::FETCH_ASSOC);

        $customer = new stdClass;
        $customer->rows = $rows;
        $customer->numRows = (int)$numRows[0]["COUNT(cId)"];
        echo json_encode($customer);
    }

    $conn = null;