module.exports =
{
  http:
  {
    server:
    {
      routes:
      {
        'create-calculation':
        {
          action  : '/calculations',
          method  : 'post',
          endpoint: 'api/endpoint/create-calculation'
        },
        'authentication':
        {
          middleware :
          [
            'api/middleware/authentication'
          ]
        },
        'append-calculation':
        {
          action  : '/calculations/.+',
          method  : 'put',
          endpoint: 'api/endpoint/append-calculation',
          dto     :
          {
            'id'    : { 'path' : 2 },
            'type'  : { 'body' : 'type' },
            'value' : { 'body' : 'value' }
          }
        }
      }
    }
  },
  authentication:
  {
    apikey : 'ABC123456789'
  }
}
