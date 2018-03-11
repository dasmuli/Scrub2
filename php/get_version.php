<?php

include 'mysql_credentials.php';

$organization       = $_GET['organization'];
$project            = $_GET['project'];
$access_token_hash  = $_GET['access_token_hash'];

$result->db_success = true;
$result->access_granted = true;
$result->document_version_hash = 'undefined';
$result->new_project = false;

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    // set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $conn->prepare("SELECT access_token_hash, document_version_hash FROM Scrub2MainData WHERE organization = ? AND project = ?");
    $stmt->execute(array($organization, $project)); 

    // set the resulting array to associative
    $stmt->setFetchMode(PDO::FETCH_ASSOC);
    if($row = $stmt->fetch()) {
        if($access_token_hash == $row['access_token_hash'])
        {
          $result->document_version_hash = $row['document_version_hash'];
        }
        else
        {
            $result->access_granted = false;
        }
    }
    else  // empty info -> no project at position
    {
        $result->new_project = true;
    }
}
catch(PDOException $e)
{
    $result->db_success = false;
    $result->error_message = $e->getMessage();
}

$myJSON = json_encode($result);

echo $myJSON;

$conn = null;
?>
