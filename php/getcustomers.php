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
            $filtersArr = db::sanitizeFilters($rules->filters);
            $sql = "";

            foreach ($filtersArr as $i => $obj) {
                if ($obj->operator) {
                    $sql .= $obj->operator . " ";
                }

                $sql .= "(" . $obj->column . " ";
                
                if ($obj->operation === "contain") {
                    $sql .= "LIKE '%" . $obj->filterValue . "%'";
                }
                elseif ($obj->operation === "startWith") {
                    $sql .= "LIKE '" . $obj->filterValue . "%'";
                }
                elseif ($obj->operation === "endWith") {
                    $sql .= "LIKE '%" . $obj->filterValue . "'";
                }
                elseif ($obj->operation === "isEmpty") {
                    $sql .= "IS NULL OR " . $obj->column . " = ''";
                }
                elseif ($obj->operation === "isNotEmpty") {
                    $sql .= "IS NOT NULL AND " . $obj->column . " != ''";
                }
                else {
                    $sql .= $obj->operation . " '" . $obj->filterValue . "'";
                }

                $sql .= ") ";
            }

            $stmt = $conn->prepare("SELECT title, fname, lname, email, parish, address, homeNo, cellNo, otherNos FROM customers WHERE " . $sql . " LIMIT :offset, :limit");
            $sqlCount = $conn->prepare("SELECT COUNT(cId) FROM customers WHERE " . $sql);

            $stmt->bindParam(':limit', $rules->limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $rules->offset, PDO::PARAM_INT);
            $stmt->execute();
            $stmt->setFetchMode(PDO::FETCH_ASSOC);
            $rows = $stmt->fetchAll();

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