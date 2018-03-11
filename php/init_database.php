<?php

include 'mysql_credentials.php';

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    // set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // sql to create table
    $sql = "CREATE TABLE Scrub2MainData (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization VARCHAR(30) NOT NULL,
    project VARCHAR(30) NOT NULL,
    access_token_hash VARCHAR(64) NOT NULL,
    document_version_hash VARCHAR(64),
    document_data TEXT
    )";

    // use exec() because no results are returned
    $conn->exec($sql);
    echo "Table Scrub2MainData created successfully";
    }
catch(PDOException $e)
{
    echo $sql . "<br>" . $e->getMessage();
}

$conn = null;
?>
