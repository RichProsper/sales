<?php

if ($_SERVER["REQUEST_METHOD"] !== "POST") die("No direct script access allowed!");

require_once 'database.php';

$conn = DB::getDbConnection();

$customer = new stdClass;
$response = new stdClass;

switch ($_POST["REQUEST_ACTION"]) {
    case "READ_ALL": {
        // Almost equivalent to PHP's htmlspecialchars_decode()
        $address = "REPLACE( REPLACE( REPLACE( REPLACE(address, '&amp;', '&'), '&quot;', '\"'), '&lt;', '<'), '&gt;', '>')";
        
        $rows = $conn->query("SELECT title, fname, lname, email, parish, $address, homeNo, cellNo, otherNos FROM customers WHERE isDeleted = 'No' LIMIT 25");
        $rows = $rows->fetchAll(PDO::FETCH_ASSOC);

        $rowIds = $conn->query("SELECT cId FROM customers WHERE isDeleted = 'No' LIMIT 25");
        $rowIds = $rowIds->fetchAll(PDO::FETCH_ASSOC);

        $numRows = $conn->query("SELECT COUNT(cId) FROM customers WHERE isDeleted = 'No'");
        $numRows = $numRows->fetchAll(PDO::FETCH_ASSOC);

        $customer->rows = $rows;
        $customer->rowIds = $rowIds;
        $customer->numRows = (int)$numRows[0]["COUNT(cId)"];

        echo json_encode($customer);
        break;
    }
    case "READ": {
        $filters = json_decode($_POST["filters"]);
        $sorts = json_decode($_POST["sorts"]);

        $address = "REPLACE( REPLACE( REPLACE( REPLACE(address, '&amp;', '&'), '&quot;', '\"'), '&lt;', '<'), '&gt;', '>')";

        $rowsSQL = "SELECT title, fname, lname, email, parish, $address, homeNo, cellNo, otherNos FROM customers WHERE (`isDeleted` = 'No')";
        $rowIdsSQL = "SELECT cId FROM customers WHERE (`isDeleted` = 'No')";
        $numRowsSQL = "SELECT COUNT(cId) FROM customers WHERE (`isDeleted` = 'No')";

        $limit = DB::sanitizeLimit( intval($_POST["limit"]) );
        $offset = DB::sanitizeOffset( intval($_POST["offset"]) );

        $r_ri = ""; // for rows & row Ids
        $nr = ""; // For num rows

        if (count($filters) > 0) {
            $filtersArr = DB::sanitizeFilters($filters);
            $filtersSQL = "";

            foreach ($filtersArr as $i => $obj) {
                if ($obj->operator) {
                    $filtersSQL .= $obj->operator . " ";
                }

                $filtersSQL .= "(`" . $obj->column . "` ";
                
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
                    $filtersSQL .= "IS NULL OR `" . $obj->column . "` = ''";
                }
                elseif ($obj->operation === "isNotEmpty") {
                    $filtersSQL .= "IS NOT NULL AND `" . $obj->column . "` != ''";
                }
                else {
                    $filtersSQL .= $obj->operation . " '" . $obj->filterValue . "'";
                }

                $filtersSQL .= ") ";
            }

            $r_ri .= " AND (" . $filtersSQL . ")";
            $nr .= " AND (" . $filtersSQL . ")";
        }

        if (count($sorts) > 0) {
            $sortsArr = DB::sanitizeSorts($sorts);
            $sortsSQL = "";

            for ($i = 0; $i < count($sortsArr); $i++) {
                $sortsSQL .= "`" . $sortsArr[$i]->column . "` " . $sortsArr[$i]->direction;

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
    } // case "READ"
    case "CREATE": {
        $title = $_POST["title"];
        $fname = ucwords($_POST["fname"]);
        $lname = ucwords($_POST["lname"]);
        $email = $_POST["email"];
        $parish = $_POST["parish"];
        $address = DB::escapeString($_POST["address"]);
        $homeNo = $_POST["homeNo"];
        $cellNo = $_POST["cellNo"];
        $otherNos = $_POST["otherNos"];

        $valid["title"] = empty($title) ? true : Validate::Title($title);
        $valid["fname"] = Validate::Name($fname);
        $valid["lname"] = empty($lname) ? true : Validate::Name($lname);
        $valid["email"] = empty($email) ? true : Validate::Email($email);
        $valid["parish"] = empty($parish) ? true : Validate::Parish($parish);
        $valid["homeNo"] = empty($homeNo) ? true : Validate::TelNo($homeNo);
        $valid["cellNo"] = empty($cellNo) ? true : Validate::TelNo($cellNo);
        $valid["otherNos"] = empty($otherNos) ? true : Validate::MultTelNos($otherNos);

        if ( !array_search(false, $valid, true) ) {
            try {
                $conn->exec("INSERT INTO customers VALUES (NULL, '$title', '$fname', '$lname', '$email', '$parish', '$address', '$homeNo', '$cellNo', '$otherNos', NULL, NULL, 'No', NULL)");

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
    }
    case "DELETE": {
        $ids = json_decode($_POST["ids"]);

        if ( Validate::IDs($ids) ) {
            $sql = "UPDATE customers SET `isDeleted` = 'Yes' WHERE cId IN (";
    
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
    }
    case "UPDATE": {
        $id = intval($_POST["id"]);
        $column = $_POST["column"];
        $value = $_POST["value"];

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
                $validValue = empty($value) ? true : Validate::TelNo($value);
                break;
            case "otherNos" :
                $validValue = empty($value) ? true : Validate::MultTelNos($value);
                break;
            default :
                $validValue = false;
        }
    
        if ($validID && $validValue) {
            try {
                $conn->exec("UPDATE customers SET `$column` = '$value' WHERE cId = $id");
    
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
    }
    default: {
        $req_action = $_POST["REQUEST_ACTION"];
        echo json_encode("Action '$req_action' not recognized");
    }
}

$conn = null;