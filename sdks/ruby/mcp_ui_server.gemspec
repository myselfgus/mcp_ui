require_relative "lib/mcp_ui_server/version"

Gem::Specification.new do |spec|
  spec.name        = "mcp_ui_server"
  spec.version     = McpUiServer::VERSION
  spec.authors     = ["Your Name"]
  spec.email       = ["your@email.com"]
  spec.summary     = "Ruby Server SDK for MCP UI"
  spec.description = "A Ruby server SDK for MCP UI."
  spec.homepage    = "https://github.com/idosal/mcp-ui"
  spec.license     = "Apache-2.0"

  spec.files = Dir["{lib}/**/*.rb", "README.md"]

  spec.require_paths = ["lib"]

  # Add any runtime dependencies here
  # spec.add_dependency "http"

  # Add any development dependencies here
  # spec.add_development_dependency "rspec"
end 