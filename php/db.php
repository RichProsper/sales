<?php

class db {
    public static function getDbConnection() {
        try {
            $connString = "mysql:host=localhost;dbname=sales_db";
            $user = "root";
            $pass = "";
            $conn = new PDO($connString, $user, $pass);
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        }
        catch (PDOException $e) {
            $conn = null;
            die($e->getMessage());
        }
        return $conn;
    }
} // class db