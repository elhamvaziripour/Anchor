<?php

	//Privilages for sending custom headers	
	header('Access-Control-Allow-Origin: *');
	header("Access-Control-Allow-Methods: POST, GET");      
	header('Custom-Header: Own-Data');
	header('Access-Control-Expose-Headers: Custom-Header');

	//Make the dynamic Content	
	function dynamicContent($verification, $submit) {
		if($verification and !$submit){	
  			return "<form action='' id='usrform'method='post'><div><textarea name ='clientcomment' id='clientcomment' rows='4' cols='100'  placeholder='You can type your text here and sign it'>
This is just a test!
edit it and use the extension to sign it with your private key!
In order to see the verification of your signature by server, push the verify button below!
</textarea></div><p><button name ='verify' type='submit' id='verify'>Verify!</button>
        </p>
      
        </form>";
		}
		if($verification and $submit){
				return ("Yes! your signature is valid :)");
			}	
		else
			return ("Sorry! your signature is not valid :)");

	}

	
	//Encode data to base64
	function base64url_encode($data) { 
		return strtr(base64_encode($data), '+/', '-_'); 
	} 

	//Decode data from base64
	function base64url_decode($data) { 
		return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT)); 
	} 

	//Recieve the request
	$request = file_get_contents('php://input');
	
	//Download the headers in the requests
	$headers = getallheaders();
	
	//Extract the signature and digest from header
	$signature = $headers['signature'];
	$digest = $headers['digest'];

	//Assume we have the public key of the clients upfront
	$pub_key = openssl_pkey_get_public(file_get_contents('./public_key.pem'));
	$pubkey=openssl_pkey_get_details($pub_key);
	$pubkey=$pubkey["key"];	
	
	if(!$pubkey or !$signature or !$digest)
		{
			die('Failed to retrieve headers.'."\n"); 

		}
		else
		{
			//Verify the signiture of the client based on the request body and the public key of the client
			$ok =openssl_verify ($request , base64url_decode($signature), $pubkey, $digest );
		}

	//Create the http body response	
	$response = '<html><head><title>Elham Test</title>';
	$response .= '<body>' . dynamicContent($ok,isset($_POST['verify'])) .'</body>';
	$response .= '</html>';
 
	//Server loads the private key to sign the body response	
	$private_pair = file_get_contents('./private_key.pem');
	if (!openssl_pkey_export($private_pair, $privateKey)) die('Failed to retrieve saved private key.'."\n");
	

	//Sign the response and upload the signature into header of the responses
	openssl_sign ( $response , $signature ,  $privateKey , $signature_alg = "sha256" );
	header('signature:'.base64url_encode($signature));
	header('digest: sha256');

	//Load the page
	echo $response;


?>

