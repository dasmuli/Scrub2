<?php

include 'mysql_credentials.php';

$data = json_decode(file_get_contents('php://input'), true);

$user_group_name    = $data['user_group_name'];
$project_name       = $data['project_name'];
$access_token       = $data['access_token'];
$command            = $data['command'];

$result->error                  = false;
$result->db_success             = true;
$result->access_granted         = true;
$result->document_version_hash  = 'undefined';
$result->new_project            = false;

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    // set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    if($command == 'upload_data')
    {
        // echo
        $result->data = $data['document'];
    }
    else if($command == "get_version")
    {
        $stmt = $conn->prepare("SELECT access_token_hash, document_version_hash FROM Scrub2MainData WHERE organization = ? AND project = ?");
        $stmt->execute(array($organization, $project)); 
        // set the resulting array to associative
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        if($row = $stmt->fetch()) {
            $result->db_success = true;
            if($access_token_hash == $row['access_token_hash'])
            {
                $result->access_granted = true;
                $result->document_version_hash = $row['document_version_hash'];
            }
            else
            {
                $result->error = true;
                $result->access_granted = false;
                $result->error_message = "Access denied";
            }
        }
        else  // empty info -> no project at position
        {
            $result->new_project = true;
        }
    }
    else
    {
        $result->error_message = "Unknown command: ".$command;
        $result->error = true;
    }
}
catch(PDOException $e)
{
    $result->error = true;
    $result->db_success = false;
    $result->error_message = $e->getMessage();
}

$myJSON = json_encode($result);

echo $myJSON;

$conn = null;
?>
