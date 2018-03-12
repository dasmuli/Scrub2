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

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    // set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    if($command == 'upload_data')
    {
        $sql = "INSERT INTO Scrub2MainData (organization, project, access_token_hash, document_data) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE num_entries = num_entries + 1;";
        // Prepare statement
        $stmt = $conn->prepare($sql);
        // execute the query
        $stmt->execute(array($user_group_name, $project_name, $access_token, $data['document']));
        // echo a message to say the UPDATE succeeded
        //if($stmt->rowCount() != 1)  // ALLWAYS2?
        //{
        //    $result->db_success  = false;
        //    $result->error_message = "1 row to be updated, but #:".$stmt->rowCount();
        //}
    }
    else if($command == "get_version")
    {
        $stmt = $conn->prepare("SELECT access_token_hash, num_entries FROM Scrub2MainData WHERE organization = ? AND project = ?");
        $stmt->execute(array($organization, $project)); 
        // set the resulting array to associative
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        if($row = $stmt->fetch()) {
            $result->db_success = true;
            if($access_token_hash == $row['access_token_hash'])
            {
                $result->access_granted = true;
                $result->num_entries = $row['num_entries'];
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
