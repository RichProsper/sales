<?php

require_once 'db.php';
$conn = db::getDbConnection();

$FinalSTMT = "SELECT title, fname, lname, email, parish, address, homeNo, cellNo, otherNos FROM customers";
$CountSQL = "SELECT COUNT(cId) FROM customers";
$RowIDsSQL = "SELECT cId FROM customers";

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $FinalSTMT .= " LIMIT 25";
    $RowIDsSQL .= " LIMIT 25";
}
else if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $rules = json_decode( file_get_contents("php://input") );
    $limit = db::sanitizeLimit($rules->limit);
    $offset = db::sanitizeOffset($rules->offset);

    $stmt = "";
    $sql = "";

    if (count($rules->filters) > 0) {
        $filtersArr = db::sanitizeFilters($rules->filters);
        $filterSTMT = "";

        foreach ($filtersArr as $i => $obj) {
            if ($obj->operator) {
                $filterSTMT .= $obj->operator . " ";
            }

            $filterSTMT .= "(" . $obj->column . " ";
            
            if ($obj->operation === "contain") {
                $filterSTMT .= "LIKE '%" . $obj->filterValue . "%'";
            }
            elseif ($obj->operation === "startWith") {
                $filterSTMT .= "LIKE '" . $obj->filterValue . "%'";
            }
            elseif ($obj->operation === "endWith") {
                $filterSTMT .= "LIKE '%" . $obj->filterValue . "'";
            }
            elseif ($obj->operation === "isEmpty") {
                $filterSTMT .= "IS NULL OR " . $obj->column . " = ''";
            }
            elseif ($obj->operation === "isNotEmpty") {
                $filterSTMT .= "IS NOT NULL AND " . $obj->column . " != ''";
            }
            else {
                $filterSTMT .= $obj->operation . " '" . $obj->filterValue . "'";
            }

            $filterSTMT .= ") ";
        }

        $stmt .= " WHERE " . $filterSTMT;
        $sql .= " WHERE " . $filterSTMT;
    }

    if (count($rules->sorts) > 0) {
        $sortsArr = db::sanitizeSorts($rules->sorts);
        $sortsSTMT = "";

        for ($i = 0; $i < count($sortsArr); $i++) {
            $sortsSTMT .= $sortsArr[$i]->column . " " . $sortsArr[$i]->direction;

            if ($i < (count($sortsArr) - 1) ) $sortsSTMT .= ", ";
        }

        $stmt .= " ORDER BY " . $sortsSTMT;
    }
    
    $FinalSTMT .= $stmt . " LIMIT " . $offset . ", " . $limit;
    $RowIDsSQL .= $stmt . " LIMIT " . $offset . ", " . $limit;
    $CountSQL .= $sql;
}

$Rows = $conn->query($FinalSTMT);
$Rows = $Rows->fetchAll(PDO::FETCH_ASSOC);

$RowIDs = $conn->query($RowIDsSQL);
$RowIDs = $RowIDs->fetchAll(PDO::FETCH_ASSOC);

$numRows = $conn->query($CountSQL);
$numRows = $numRows->fetchAll(PDO::FETCH_ASSOC);

$customer = new stdClass;
$customer->rows = $Rows;
$customer->rowIds = $RowIDs;
$customer->numRows = (int)$numRows[0]["COUNT(cId)"];

echo json_encode($customer);
$conn = null;