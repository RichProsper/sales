<?php

if ($_SERVER["REQUEST_METHOD"] !== "POST") die("No direct script access allowed!");

require_once 'database.php';

$conn = DB::getDbConnection();
$req = json_decode( file_get_contents("php://input") );

$customer = new stdClass;
$response = new stdClass;

switch ($req->action) {
    case "READ_ALL" :
        $rows = $conn->query("SELECT title, fname, lname, email, parish, address, homeNo, cellNo, otherNos FROM customers LIMIT 25");
        $rows = $rows->fetchAll(PDO::FETCH_ASSOC);

        $rowIds = $conn->query("SELECT cId FROM customers LIMIT 25");
        $rowIds = $rowIds->fetchAll(PDO::FETCH_ASSOC);

        $numRows = $conn->query("SELECT COUNT(cId) FROM customers");
        $numRows = $numRows->fetchAll(PDO::FETCH_ASSOC);

        $customer->rows = $rows;
        $customer->rowIds = $rowIds;
        $customer->numRows = (int)$numRows[0]["COUNT(cId)"];

        echo json_encode($customer);
        break;
    case "READ" :
        $rowsSQL = "SELECT title, fname, lname, email, parish, address, homeNo, cellNo, otherNos FROM customers";
        $rowIdsSQL = "SELECT cId FROM customers";
        $numRowsSQL = "SELECT COUNT(cId) FROM customers";

        $limit = DB::sanitizeLimit($req->payload->limit);
        $offset = DB::sanitizeOffset($req->payload->offset);

        $r_ri = ""; // for rows & row Ids
        $nr = ""; // For num rows

        if (count($req->payload->filters) > 0) {
            $filtersArr = DB::sanitizeFilters($req->payload->filters);
            $filtersSQL = "";

            foreach ($filtersArr as $i => $obj) {
                if ($obj->operator) {
                    $filtersSQL .= $obj->operator . " ";
                }

                $filtersSQL .= "(" . $obj->column . " ";
                
                if ($obj->operation === "contain") {
                    $filtersSQL .= "LIKE '%" . $obj->filterValue . "%'";
                }
                elseif ($obj->operation === "startWith") {
                    $filtersSQL .= "LIKE '" . $obj->filterValue . "%'";
                }
                elseif ($obj->operation === "endWith") {
                    $filtersSQL .= "LIKE '%" . $obj->filterValue . "'";
                }
                elseif ($obj->operation === "isEmpty") {
                    $filtersSQL .= "IS NULL OR " . $obj->column . " = ''";
                }
                elseif ($obj->operation === "isNotEmpty") {
                    $filtersSQL .= "IS NOT NULL AND " . $obj->column . " != ''";
                }
                else {
                    $filtersSQL .= $obj->operation . " '" . $obj->filterValue . "'";
                }

                $filtersSQL .= ") ";
            }

            $r_ri .= " WHERE " . $filtersSQL;
            $nr .= " WHERE " . $filtersSQL;
        }

        if (count($req->payload->sorts) > 0) {
            $sortsArr = DB::sanitizeSorts($req->payload->sorts);
            $sortsSQL = "";

            for ($i = 0; $i < count($sortsArr); $i++) {
                $sortsSQL .= $sortsArr[$i]->column . " " . $sortsArr[$i]->direction;

                if ($i < (count($sortsArr) - 1) ) $sortsSQL .= ", ";
            }

            $r_ri .= " ORDER BY " . $sortsSQL;
        }
        
        $rows = $conn->query($rowsSQL . $r_ri . " LIMIT " . $offset . ", " . $limit);
        $rows = $rows->fetchAll(PDO::FETCH_ASSOC);

        $rowIds = $conn->query($rowIdsSQL . $r_ri . " LIMIT " . $offset . ", " . $limit);
        $rowIds = $rowIds->fetchAll(PDO::FETCH_ASSOC);

        $numRows = $conn->query($numRowsSQL . $nr);
        $numRows = $numRows->fetchAll(PDO::FETCH_ASSOC);

        $customer->rows = $rows;
        $customer->rowIds = $rowIds;
        $customer->numRows = (int)$numRows[0]["COUNT(cId)"];

        echo json_encode($customer);
        break;
    case "CREATE" :
        $title = $req->payload->title;
        $fname = ucwords($req->payload->fname);
        $lname = ucwords($req->payload->lname);
        $email = $req->payload->email;
        $parish = $req->payload->parish;
        $address = DB::escapeString($req->payload->address);
        $homeNo = $req->payload->homeNo;
        $cellNo = $req->payload->cellNo;
        $otherNos = $req->payload->otherNos;

        $valid['title'] = empty($title) ? true : Validate::Title($title);
        $valid['fname'] = Validate::Name($fname);
        $valid['lname'] = empty($lname) ? true : Validate::Name($lname);
        $valid['email'] = empty($email) ? true : Validate::Email($email);
        $valid['parish'] = empty($parish) ? true : Validate::Parish($parish);
        $valid['homeNo'] = empty($homeNo) ? true : Validate::Tel($homeNo);
        $valid['cellNo'] = empty($cellNo) ? true : Validate::Tel($cellNo);
        $valid['otherNos'] = empty($otherNos) ? true : Validate::MultTel($otherNos);

        if ( !array_search(false, $valid, true) ) {
            try {
                $conn->exec("INSERT INTO customers VALUES (NULL, '$title', '$fname', '$lname', '$email', '$parish', '$address', '$homeNo', '$cellNo', '$otherNos', NULL, NULL)");

                $response->success = true;
                $response->message = "New record added successfully.";
            }
            catch(PDOException $e) {
                $response->success = false;
                $response->message = $e->getMessage();
            }
        }
        else {
            $response->success = false;
            $response->message = $valid;
        }
        
        echo json_encode($response);
        break;
    case "DELETE" :
        $ids = $req->payload;

        if ( Validate::IDs($ids) ) {
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
        break;
    case "UPDATE" :
        $id = $req->payload->id;
        $column = $req->payload->column;
        $value = $req->payload->value;

        $validID = Validate::ID($id);
        $validValue = true;
    
        switch ($column) {
            case "title" :
                $validValue = empty($value) ? true : Validate::Title($value);
                break;
            case "fname" :
                $validValue = Validate::Name($value);
                break;
            case "lname" :
                $validValue = empty($value) ? true : Validate::Name($value);
                break;
            case "email" :
                $validValue = empty($value) ? true : Validate::Email($value);
                break;
            case "parish" :
                $validValue = empty($value) ? true : Validate::Parish($value);
                break;
            case "address" :
                $value = DB::escapeString($value);
                break;
            case "homeNo" :
            case "cellNo" :
                $validValue = empty($value) ? true : Validate::Tel($value);
                break;
            case "otherNos" :
                $validValue = empty($value) ? true : Validate::MultTel($value);
                break;
            default :
                $validValue = false;
        }
    
        if ($validID && $validValue) {
            try {
                $conn->exec("UPDATE customers SET $column = '$value' WHERE cId = $id");
    
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
        break;
    default :
        echo json_encode("Action '$req->action' not recognized");
}

$conn = null;