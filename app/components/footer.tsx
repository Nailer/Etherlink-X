export function Footer() {
  return (
    <footer className="bg-white/50 backdrop-blur-sm border-t border-purple-100">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Product</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <button className="text-sm text-gray-600 hover:text-purple-600">Exchange</button>
              </li>
              <li>
                <button className="text-sm text-gray-600 hover:text-purple-600">Bridge</button>
              </li>
              <li>
                <button className="text-sm text-gray-600 hover:text-purple-600">Gas Station</button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <button className="text-sm text-gray-600 hover:text-purple-600">Documentation</button>
              </li>
              <li>
                <button className="text-sm text-gray-600 hover:text-purple-600">API</button>
              </li>
              <li>
                <button className="text-sm text-gray-600 hover:text-purple-600">Support</button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <button className="text-sm text-gray-600 hover:text-purple-600">About</button>
              </li>
              <li>
                <button className="text-sm text-gray-600 hover:text-purple-600">Blog</button>
              </li>
              <li>
                <button className="text-sm text-gray-600 hover:text-purple-600">Careers</button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Social</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <button className="text-sm text-gray-600 hover:text-purple-600">Twitter</button>
              </li>
              <li>
                <button className="text-sm text-gray-600 hover:text-purple-600">Discord</button>
              </li>
              <li>
                <button className="text-sm text-gray-600 hover:text-purple-600">GitHub</button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-purple-100 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-purple-800 rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-sm transform rotate-45"></div>
            </div>
            <span className="font-bold text-gray-900">ETHERLINK</span>
          </div>
          <p className="mt-4 md:mt-0 text-sm text-gray-600">© 2024 ETHERLINK Exchange. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
