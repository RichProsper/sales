<?php    
    require_once 'db.php';
    $conn = db::getDbConnection();

    $FinalSTMT = "SELECT title, fname, lname, email, parish, address, homeNo, cellNo, otherNos FROM customers";
    $FinalSQL = "SELECT COUNT(cId) FROM customers";

    if ($_SERVER["REQUEST_METHOD"] === "GET") {
        $FinalSTMT .= " LIMIT 25";
    }
    else if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $rules = json_decode( file_get_contents("php://input") );
        $limit = db::sanitizeLimit($rules->limit);
        $offset = db::sanitizeOffset($rules->offset);

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

            $FinalSTMT .= " WHERE " . $sql . " LIMIT " . $offset . ", " . $limit;
            $FinalSQL .= " WHERE " . $sql;
        }
        else {
            $FinalSTMT .= " LIMIT " . $offset . ", " . $limit;
        }
    }

    $customerRows = $conn->query($FinalSTMT);
    $customerRows = $customerRows->fetchAll(PDO::FETCH_ASSOC);

    $numRows = $conn->query($FinalSQL);
    $numRows = $numRows->fetchAll(PDO::FETCH_ASSOC);
    
    $customer = new stdClass;
    $customer->rows = $customerRows;
    $customer->numRows = (int)$numRows[0]["COUNT(cId)"];

    echo json_encode($customer);
    $conn = null;