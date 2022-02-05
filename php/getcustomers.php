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
        $rows = null;
        $numRows = null;

        if (count($rules->filters) > 0) {
            $stmtStr = "SELECT title, fname, lname, email, parish, address, homeNo, cellNo, otherNos FROM customers WHERE ";
            $sqlCountStr = "SELECT COUNT(cId) FROM customers WHERE ";

            $sql = "";
            foreach ($rules->filters as $i => $obj) {
                if ($obj->operator) {
                    $sql .= ":operator" . $i . " ";
                }

                $sql .= ":column" . $i . " ";
                
                if ($obj->operation === 'contain') {
                    $sql .= "LIKE '%:filter" . $i . "%' ";
                }
                elseif ($obj->operation === 'startWith') {
                    $sql .= "LIKE '%:filter" . $i . "' ";
                }
                elseif ($obj->operation === 'endWith') {
                    $sql .= "LIKE ':filter" . $i . "%' ";
                }
                elseif ($obj->operation === 'isEmpty') {
                    $sql .= "IS NULL OR :col" . $i . " = '' ";
                }
                elseif ($obj->operation === 'isNotEmpty') {
                    $sql .= "IS NOT NULL AND :col" . $i . " != '' ";
                }
                else {
                    $sql .= ":operation" . $i . " ':filter" . $i . "' ";
                }
            }

            $stmt = $conn->prepare($stmtStr . $sql . "LIMIT :offset, :limit");
            // $sqlCount = $conn->prepare($sqlCountStr . $sql);

            // ! FIX Uncaught PDOException: SQLSTATE[HY093]

            foreach ($rules->filters as $i => $obj) {
                if ($obj->operator) {
                    $stmt->bindValue(':operator' . $i, $obj->operator);
                    echo "operator$i, ";
                }

                $stmt->bindValue(':column' . $i, $obj->column);
                echo "column$i, ";

                if ($obj->operation === 'contain') {
                    $stmt->bindValue(':filter' . $i, $obj->filter);
                    echo "contain$i, ";
                }
                elseif ($obj->operation === 'startWith') {
                    $stmt->bindValue(':filter' . $i, $obj->filter);
                    echo "startWith$i, ";
                }
                elseif ($obj->operation === 'endWith') {
                    $stmt->bindValue(':filter' . $i, $obj->filter);
                    echo "endWith$i, ";
                }
                elseif ($obj->operation === 'isEmpty') {
                    $stmt->bindValue(':col' . $i, $obj->column);
                    echo "isEmpty$i, ";
                }
                elseif ($obj->operation === 'isNotEmpty') {
                    $stmt->bindValue(':col' . $i, $obj->column);
                    echo "isNotEmpty$i, ";
                }
                else {
                    $stmt->bindValue(':operation' . $i, $obj->operation);
                    $stmt->bindValue(':filter' . $i, $obj->filter);
                    echo "operationfilter$i, ";
                }
            }

            $stmt->bindValue(':limit', $rules->limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $rules->offset, PDO::PARAM_INT);
            echo "<br><br>";
            echo var_dump($stmt) . "<br>";
            $stmt->execute();
            $stmt->setFetchMode(PDO::FETCH_ASSOC);
            $rows = $stmt->fetchAll();

            // $sqlCount->execute();
            // $sqlCount->setFetchMode(PDO::FETCH_ASSOC);
            // $numRows = $sqlCount->fetchAll();
        }
        else {
            $stmt = $conn->prepare("SELECT title, fname, lname, email, parish, address, homeNo, cellNo, otherNos FROM customers LIMIT :offset, :limit");
            $stmt->bindParam(':limit', $rules->limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $rules->offset, PDO::PARAM_INT);
            $stmt->execute();
            $stmt->setFetchMode(PDO::FETCH_ASSOC);
            $rows = $stmt->fetchAll();

            $sql = "SELECT COUNT(cId) FROM customers";
            $numRows = $conn->query($sql);
            $numRows = $numRows->fetchAll(PDO::FETCH_ASSOC);
        }

        // $customer = new stdClass;
        // $customer->rows = $rows;
        // $customer->numRows = (int)$numRows[0]["COUNT(cId)"];
        // echo json_encode($customer);
    }

    $conn = null;