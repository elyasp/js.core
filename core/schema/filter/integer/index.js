/**
 * @implements {SchemaFilter}
 */
class SchemaFilterInteger
{
  filter(options, data)
  {
    return options.collection
    ? this.filterCollection(data)
    : this.filterSingle(data)
  }

  filterCollection(data)
  {
    if(!Array.isArray(data))
      return data

    const collection = []

    for(const item of data)
    {
      const filtered = this.filterSingle(item)
      collection.push(filtered)
    }

    return collection
  }

  filterSingle(data)
  {
    if(isNaN(data) === false)
      return +data

    return data
  }
}

module.exports = SchemaFilterInteger
