# Ruby Server SDK Overview

The `mcp_ui_server` gem provides helpers for creating and sending UI Resources from a Ruby-based MCP server.

## Installation

Add this line to your application's Gemfile:

```ruby
gem 'mcp_ui_server', git: 'https://github.com/idosal/mcp-ui'
```

And then execute:
```bundle install```

## Quick Start

The main method is `McpUiServer.create_ui_resource`. It helps you construct a valid `UIResource` payload.

Here's a simple example of creating a `rawHtml` resource:

```ruby
require 'mcp_ui_server'

resource = McpUiServer.create_ui_resource(
  uri: 'ui://my-app/greeting',
  content: {
    type: :rawHtml,
    htmlString: '<h1>Hello, World!</h1>'
  }
)

# The resulting resource hash can be serialized to JSON and sent in your API response.
```

For more detailed examples, see the [Usage Examples](./usage-examples.md) guide. 