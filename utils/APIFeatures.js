class APIFeatures {
    constructor(mongooseQuery, reqQueryString){
        //Set the class properties
        this.query = mongooseQuery,
        this.queryString = reqQueryString
    }

    //Set advanced APIFeatures Functions
    filter(){
        //Get a copy of the actual queryString, donot manipulate the actual queryString
        let queryStringCopy = this.queryString

        //Add the object fields to be removed
        const removableFields = ['sort', 'fields', 'limit', 'page']

        //Remove the removableFields from the queryStringCopy
        removableFields.forEach(element => delete(queryStringCopy[element]))

        //Apply mongoose literals to the fields
        queryStringCopy = JSON.parse(JSON.stringify(queryStringCopy).replace(/\b(g|l)te?\b/, matched => `$${matched}`))

        //Update the actual query
        this.query = this.query.find(queryStringCopy)

        //Return the object
        return this
    }

    //Define the sort method
    sort(){
        //If sort exists, perform sort
        if(this.queryString.sort){
            this.query = this.query.sort(JSON.parse(JSON.stringify(this.queryString.sort).replace(',', ' ')))
        }
        return this
    }

    //Defining the fields method
    fields(){
        //check if fields is here
        if(this.queryString.fields){
            this.query = this.query.select(JSON.parse(JSON.stringify(this.queryString.fields).replace(',', ' ')))
        }

        return this
    }

    //Defining the paging method
    page(){
        //Set default page to 1
        const page = this.queryString.page * 1 || 1
        //Set default results Limit to 10
        const limit = this.queryString.limit * 1 || 10

        //Set the skip 
        const skip = (page - 1) * limit

        //set the skip funciton
        this.query = this.query.skip(skip).limit(limit)

        return this
    }
}

//Default export class
module.exports = APIFeatures