const Request = require('@superhero/request')

class HttpRequest extends Request
{
  constructor(options, object)
  {
    super(options)
    this.object = object
  }

  fetch(method, options)
  {
    if(typeof options === 'object')
    {
      options.headers = this.object.composeLowerCaseKeyedObject(options.headers)
    }

    const response = super.fetch(method, options)
    
    response.headers = this.object.composeLowerCaseKeyedObject(response.headers)

    return response
  }
}

module.exports = HttpRequest
