export function printRoutes(app) {
    app._router.stack.forEach(print.bind(null, []));
    
    function print(path, layer) {
      if (layer.route) {
        const method = Object.keys(layer.route.methods)[0].toUpperCase();
        console.log(`${method} ${path.concat(layer.route.path).join('')}`);
      } else if (layer.name === 'router' && layer.handle.stack) {
        layer.handle.stack.forEach(print.bind(null, path.concat(layer.regexp.toString().replace('/^', '').replace('/?(?=\\/|$)/i', ''))));
      }
    }
  }