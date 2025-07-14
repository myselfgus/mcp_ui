# frozen_string_literal: true

require 'mcp_ui_server'
require 'base64'

RSpec.describe McpUiServer do
  it 'has a version number' do
    expect(McpUiServer::VERSION).not_to be_nil
  end

  describe '.create_ui_resource' do
    let(:uri) { 'ui://test/1' }

    context 'with rawHtml content' do
      let(:content) { { type: :rawHtml, htmlString: '<h1>Hello</h1>' } }

      it 'creates a resource with text/html mimetype and text delivery' do
        resource = described_class.create_ui_resource(uri: uri, content: content)
        expect(resource[:type]).to eq('resource')
        expect(resource[:resource][:uri]).to eq(uri)
        expect(resource[:resource][:mimeType]).to eq('text/html')
        expect(resource[:resource][:text]).to eq('<h1>Hello</h1>')
      end

      it 'creates a resource with blob delivery' do
        resource = described_class.create_ui_resource(uri: uri, content: content, delivery: 'blob')
        expect(resource[:resource][:blob]).to eq(Base64.strict_encode64('<h1>Hello</h1>'))
      end
    end

    context 'with externalUrl content' do
      let(:content) { { type: :externalUrl, iframeUrl: 'https://example.com' } }

      it 'creates a resource with text/uri-list mimetype' do
        resource = described_class.create_ui_resource(uri: uri, content: content)
        expect(resource[:resource][:mimeType]).to eq('text/uri-list')
        expect(resource[:resource][:text]).to eq('https://example.com')
      end
    end

    context 'with remoteDom content' do
      let(:script) { 'console.log("hello")' }

      it 'creates a resource with default react flavor' do
        content = { type: :remoteDom, script: script }
        resource = described_class.create_ui_resource(uri: uri, content: content)
        expect(resource[:resource][:mimeType]).to eq('application/vnd.mcp-ui.remote-dom; flavor=react')
        expect(resource[:resource][:text]).to eq(script)
      end

      it 'creates a resource with specified flavor' do
        content = { type: :remoteDom, script: script, flavor: 'webcomponents' }
        resource = described_class.create_ui_resource(uri: uri, content: content)
        expect(resource[:resource][:mimeType]).to eq('application/vnd.mcp-ui.remote-dom; flavor=webcomponents')
      end
    end

    context 'with invalid input' do
      it 'raises an error for unknown content type' do
        content = { type: :invalid, data: 'foo' }
        expect do
          described_class.create_ui_resource(uri: uri,
                                             content: content)
        end.to raise_error(ArgumentError, 'Unknown content type: invalid')
      end

      it 'raises an error for unknown delivery type' do
        content = { type: :rawHtml, htmlString: '<h1>Hello</h1>' }
        expect do
          described_class.create_ui_resource(uri: uri, content: content,
                                             delivery: 'invalid')
        end.to raise_error(ArgumentError, 'Unknown delivery type: invalid')
      end

      it 'raises an error if htmlString is missing' do
        content = { type: :rawHtml }
        expect { described_class.create_ui_resource(uri: uri, content: content) }.to raise_error(KeyError)
      end

      it 'raises an error if iframeUrl is missing' do
        content = { type: :externalUrl }
        expect { described_class.create_ui_resource(uri: uri, content: content) }.to raise_error(KeyError)
      end

      it 'raises an error if script is missing' do
        content = { type: :remoteDom }
        expect { described_class.create_ui_resource(uri: uri, content: content) }.to raise_error(KeyError)
      end
    end
  end
end
