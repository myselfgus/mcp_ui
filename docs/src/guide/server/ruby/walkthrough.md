# Ruby Server Walkthrough

This guide provides a step-by-step walkthrough for integrating `mcp_ui_server` into a Ruby web application using the [Sinatra](https://sinatrarb.com/) framework.

For a complete, runnable example using WEBrick, see the [`ruby-server-demo`](https://github.com/idosal/mcp-ui/tree/main/examples/ruby-server-demo).

## 1. Set up a Sinatra Application

If you don't have an existing server, you can create a simple one.

First, create a `Gemfile` with the necessary dependencies:

```ruby
source "https://rubygems.org"

gem "sinatra"
gem "sinatra-contrib" # for JSON support
```

Then, run `bundle install`.

Create a basic server file (e.g., `app.rb`):

```ruby
require 'sinatra'
require 'sinatra/json'

get '/' do
  'Hello, world!'
end
```

You can run this with `bundle exec ruby app.rb`.

## 2. Install MCP and mcp-ui Dependencies

Next, add the Model Context Protocol gem and the `mcp_ui_server` gem to your `Gemfile`:

```ruby
source "https://rubygems.org"

gem "sinatra"
gem "sinatra-contrib"
gem "mcp", git: "https://github.com/modelcontextprotocol/ruby-sdk"
gem "mcp_ui_server"
```

Run `bundle install` again.

## 3. Create an MCP Tool

In MCP, tools are classes that can be invoked by the client. For this example, we'll create a tool that returns a `UIResource`.

Create a new file, `tools.rb`, and add the following code:

```ruby
require 'mcp'
require 'mcp_ui_server'

class GreetTool < MCP::Tool
  description 'A simple tool that returns a UI resource'
  input_schema(
    type: 'object',
    properties: {}
  )

  def self.call(server_context:)
    ui_resource = McpUiServer.create_ui_resource(
      uri: 'ui://greeting',
      content: { type: :external_url, iframeUrl: 'https://example.com' },
      encoding: :text
    )

    MCP::Tool::Response.new([ui_resource])
  end
end
```