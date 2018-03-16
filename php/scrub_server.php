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

/*
if(empty($user_group_name))
{
    $result->error = true;
    $result->error_message = "User/group name is empty";
    return;
}
if(empty($project_name))
{
    $result->error = true;
    $result->error_message = "Project name is empty";
    return;
}
if(empty($access_token))
{
    $result->error = true;
    $result->error_message = "Access token is empty";
    return;
}
if(empty($command))
{
    $result->error = true;
    $result->error_message = "Command is empty";
    return;
}
*/

function check_access_token($conn)
{
    $stmt = $conn->prepare("SELECT access_token_hash FROM Scrub2MainData WHERE organization = ? AND project = ?");
    $stmt->execute(array($user_group_name, $project_name)); 
    // set the resulting array to associative
    $stmt->setFetchMode(PDO::FETCH_ASSOC);
    if($row = $stmt->fetch())
    {
        $result->db_success = true;
        if($access_token == $row['access_token_hash'])
        {
            $result->access_granted = true;
            $result->num_entries = $row['num_entries'];
            return true;
        }
        else
        {
            $result->error = true;
            $result->access_granted = false;
            $result->error_message = "Access denied";
            return false;
        }
    }
    else
    {
        $result->access_granted = true;
        return true;
    }
}


try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    // set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // global access token check
    if(!check_access_token($conn))
    {
        return;
    }

    $result->error_message = "Unknown command: ".$command;
    $result->error = true;

    if($command == "download_data")
    {
        $result->error = false;
        $stmt = $conn->prepare("SELECT document_data, num_entries FROM Scrub2MainData WHERE organization = ? AND project = ?");
        $stmt->execute(array($user_group_name, $project_name)); 
        // set the resulting array to associative
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        if($row = $stmt->fetch()) {
            $result->db_success = true;
            $result->num_entries = $row['num_entries'];
            $result->document    = $row['document_data'];
        }
        else  // empty info -> no project at position
        {
            $result->error = true;
            $result->error_message = 'No document entry found';
        }
    }
    else if($command == 'upload_data')
    {
        $result->error = false;
        $sql = "INSERT INTO Scrub2MainData (organization, project, access_token_hash, document_data)
        VALUES (:org,:proj,:access,:doc) ON DUPLICATE KEY UPDATE
        document_data = :doc, 
        num_entries = num_entries + 1";
        // Prepare statement
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':org'     , $user_group_name);
        $stmt->bindParam(':proj'    , $project_name);
        $stmt->bindParam(':access'  , $access_token);
        $stmt->bindParam(':doc'     , $data['document']);
        // execute the query
        $stmt->execute();
        // echo a message to say the UPDATE succeeded
    }
    if($command == "get_version" || $command == 'upload_data') // upload returns id
    {
        $result->error = false;
        $stmt = $conn->prepare("SELECT access_token_hash, num_entries FROM Scrub2MainData WHERE organization = ? AND project = ?");
        $stmt->execute(array($user_group_name, $project_name)); 
        // set the resulting array to associative
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        if($row = $stmt->fetch()) {
            $result->db_success = true;
            $result->num_entries = $row['num_entries'];
        }
        else  // empty info -> no project at position
        {
            $result->new_project = true;
        }
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
