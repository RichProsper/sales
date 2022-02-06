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
            $sql = "";
            foreach ($rules->filters as $i => $obj) {
                if ($obj->operator) {
                    $sql .= $obj->operator . " ";
                }

                $sql .= $obj->column . " ";
                
                if ($obj->operation === "contain") {
                    $sql .= "LIKE '%" . $obj->filter . "%' ";
                }
                elseif ($obj->operation === "startWith") {
                    $sql .= "LIKE '%" . $obj->filter . "' ";
                }
                elseif ($obj->operation === "endWith") {
                    $sql .= "LIKE '" . $obj->filter . "%' ";
                }
                elseif ($obj->operation === "isEmpty") {
                    // $sql .= "IS NULL OR " . $obj->column . " = '' ";
                    $sql .= "IS NULL ";
                }
                elseif ($obj->operation === "isNotEmpty") {
                    // $sql .= "IS NOT NULL AND " . $obj->column . " != '' ";
                    $sql .= "IS NOT NULL ";
                }
                else {
                    $sql .= $obj->operation . " '" . $obj->filter . "' ";
                }
            }

            // $stmt = $conn->prepare("SELECT title, fname, lname, email, parish, address, homeNo, cellNo, otherNos FROM customers WHERE :sql LIMIT :offset, :limit");
            $stmt = $conn->prepare("SELECT title, fname, lname, email, parish, address, homeNo, cellNo, otherNos FROM customers WHERE " . $sql . " LIMIT :offset, :limit");
            // $sqlCount = $conn->prepare("SELECT COUNT(cId) FROM customers WHERE :sql");
            $sqlCount = $conn->prepare("SELECT COUNT(cId) FROM customers WHERE " . $sql);

            // $stmt->bindParam(':sql', $sql, PDO::PARAM_STR);
            $stmt->bindParam(':limit', $rules->limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $rules->offset, PDO::PARAM_INT);
            $stmt->execute();
            $stmt->setFetchMode(PDO::FETCH_ASSOC);
            $rows = $stmt->fetchAll();

            // $sqlCount->bindParam(':sql', $sql, PDO::PARAM_STR);
            $sqlCount->execute();
            $sqlCount->setFetchMode(PDO::FETCH_ASSOC);
            $numRows = $sqlCount->fetchAll();
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

        $customer = new stdClass;
        $customer->rows = $rows;
        $customer->numRows = (int)$numRows[0]["COUNT(cId)"];
        // $customer->numRows = 66;
        echo json_encode($customer);
    }

    $conn = null;