const
DtoBuilderContractNotHoneredError = require('./error/dto-builder-contract-not-honered'),
RoutesInvalidTypeError            = require('./error/routes-invalid-type'),
InvalidRouteInputError            = require('./error/invalid-route-input'),
InvalidDtoError                   = require('./error/invalid-dto'),
NoRouteFoundError                 = require('./error/no-route-found'),
NoEndpointDefinedError            = require('./error/no-endpoint-defined')

class HttpServerRouteBuilder
{
  constructor(deepmerge, composer)
  {
    this.dtoBuilders  = []
    this.deepmerge    = deepmerge
    this.composer     = composer
  }

  /**
   * @param {Array} routes
   * @param {Object} request
   */
  build(routes, request)
  {
    if(typeof routes !== 'object')
    {
      const msg = 'routes must be built from an object'
      throw new RoutesInvalidTypeError(msg)
    }

    const
    validRoutes = this.fetchValidRoutes(routes, request),
    route       = this.deepmerge.merge({}, ...validRoutes)

    if(!validRoutes.length)
    {
      const msg = 'Could not find a matching route'
      throw new NoRouteFoundError(msg)
    }

    if(!route.endpoint)
    {
      const msg = `No endpoint defined in route for the request: ${request.method} -> ${request.url}`
      throw new NoEndpointDefinedError(msg)
    }

    if(!('input' in route))
    {
      const msg = 'route requires a defintion of an input schema, "false" is an acceptable value'
      throw new InvalidRouteInputError(msg)
    }

    try
    {
      if(route.input)
      {
        route.dto = this.composeDto(request, route)
      }

      return route
    }
    catch(error)
    {
      throw new InvalidDtoError(error.message)
    }
  }

  /**
   * @param {Array} routes
   * @param {Object} request
   */
  fetchValidRoutes(routes, request)
  {
    const validRoutes = []

    for(const name in routes)
    {
      const
      route   = routes[name],
      url     = route.url     && new RegExp(`^${route.url.replace(/\/:(\w+)/g, '/.+').replace(/\/+$/g, '')}$`),
      method  = route.method  && new RegExp(`^${route.method}$`, 'i')

      if(request.url    .match(url)
      && request.method .match(method))
      {
        validRoutes.push(route)

        // when an endpoint has been found, the route is terminated
        if(route.endpoint)
        {
          break
        }
      }
    }

    return validRoutes
  }

  /**
   * @param {HttpServerRouteBuilderDtoBuilder} dtoBuilder
   */
  addDtoBuilder(dtoBuilder)
  {
    if(typeof dtoBuilder.build !== 'function')
    {
      const msg = 'Expected "dtoBuilder" to have a build function'
      throw new DtoBuilderContractNotHoneredError(msg)
    }

    return this.dtoBuilders.push(dtoBuilder)
  }

  /**
   * @param {number} index
   */
  removeDtoBuilder(index)
  {
    return delete this.dtoBuilders[index - 1]
  }

  /**
   * @param {Object} request
   * @param {Object} route
   */
  composeDto(request, route)
  {
    const dto = {}

    for(const index in this.dtoBuilders)
    {
      const dtoBuilder = this.dtoBuilders[index]
      dtoBuilder.build(dto, route, request)
    }

    return this.composer.compose(route.input, dto)
  }
}

module.exports = HttpServerRouteBuilder
