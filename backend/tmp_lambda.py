import json
from pprint import PrettyPrinter
pp = PrettyPrinter(indent=2)

def handler(event, context):
    print("THIS IS THE EVENT\n")
    pp.pprint(event)
    print("-------------------")

    print("NOW WE PROCESS event, try to parse from JSON string to dict\n")
    body = event['body']
    pathParameters = event['pathParameters']

    print(f"type body: {type(body)}")
    print(f"type pathParameters: {type(pathParameters)}")
    
    try:
        body = json.loads(event['body'])
    except json.decoder.JSONDecodeError:
        print("body could not be parsed, take as is")
        
    print("BODY\n")
    pp.pprint(body)
    
    print("PATHPARAMS\n")
    pp.pprint(pathParameters)

    return({
        "statusCode":200,
        "headers":{},
        "body":{
            "did i process?": "yes, I processed",
            "body of event": body,
            "path parameter": pathParameters    
        }
    })