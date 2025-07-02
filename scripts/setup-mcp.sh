#!/bin/bash

# SnapCalc MCP Server Setup Script
# This script helps set up the PaddleOCR MCP server integration

set -e

echo "🚀 SnapCalc MCP Server Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check Node.js version
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="16.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    print_error "Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 16+ first."
    exit 1
fi

print_status "Node.js version $NODE_VERSION is compatible"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "npm is available"

# Install MCP SDK dependencies
echo
echo "📦 Installing MCP dependencies..."

npm install @modelcontextprotocol/sdk
if [ $? -eq 0 ]; then
    print_status "MCP SDK installed successfully"
else
    print_error "Failed to install MCP SDK"
    exit 1
fi

npm install sharp
if [ $? -eq 0 ]; then
    print_status "Sharp image processing library installed"
else
    print_error "Failed to install Sharp"
    exit 1
fi

# Make MCP server executable
echo
echo "🔧 Setting up MCP server..."

if [ -f "mcp-server.js" ]; then
    chmod +x mcp-server.js
    print_status "MCP server made executable"
else
    print_error "mcp-server.js not found. Please ensure you're in the correct directory."
    exit 1
fi

# Test MCP server
echo
echo "🧪 Testing MCP server..."

# Create a simple test to verify the server starts
timeout 10s node mcp-server.js &
SERVER_PID=$!

sleep 2

if kill -0 $SERVER_PID 2>/dev/null; then
    print_status "MCP server starts successfully"
    kill $SERVER_PID 2>/dev/null || true
else
    print_error "MCP server failed to start"
    exit 1
fi

# Generate configuration files
echo
echo "📄 Generating configuration files..."

# Create Claude Desktop config
CLAUDE_CONFIG_DIR="$HOME/.config/claude-desktop"
CLAUDE_CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"

mkdir -p "$CLAUDE_CONFIG_DIR"

if [ ! -f "$CLAUDE_CONFIG_FILE" ]; then
    cat > "$CLAUDE_CONFIG_FILE" << EOF
{
  "mcpServers": {
    "snapcalc-ocr": {
      "command": "node",
      "args": ["$(pwd)/mcp-server.js"]
    }
  }
}
EOF
    print_status "Claude Desktop configuration created at $CLAUDE_CONFIG_FILE"
else
    print_warning "Claude Desktop configuration already exists at $CLAUDE_CONFIG_FILE"
    print_info "You may need to manually add the SnapCalc MCP server configuration"
fi

# Create VS Code configuration example
VS_CODE_CONFIG="vscode-mcp-config.json"
cat > "$VS_CODE_CONFIG" << EOF
{
  "mcp": {
    "servers": {
      "snapcalc-ocr": {
        "command": "node",
        "args": ["$(pwd)/mcp-server.js"]
      }
    }
  }
}
EOF
print_status "VS Code MCP configuration example created: $VS_CODE_CONFIG"

# Create test images directory
echo
echo "📁 Setting up test environment..."

mkdir -p test-images
print_status "Test images directory created"

# Create a simple test script
cat > test-mcp.js << 'EOF'
#!/usr/bin/env node

// Simple test script for SnapCalc MCP server
const { spawn } = require('child_process');

console.log('🧪 Testing SnapCalc MCP Server...');

const server = spawn('node', ['mcp-server.js']);

server.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

server.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Send a test message after 2 seconds
setTimeout(() => {
  const testMessage = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
  }) + '\n';
  
  server.stdin.write(testMessage);
  
  setTimeout(() => {
    server.kill();
  }, 3000);
}, 2000);
EOF

chmod +x test-mcp.js
print_status "Test script created: test-mcp.js"

# Display completion message
echo
echo "🎉 Setup Complete!"
echo "=================="
echo
print_info "SnapCalc MCP Server has been successfully set up!"
echo
echo "📋 What's been configured:"
echo "  • MCP SDK and dependencies installed"
echo "  • MCP server made executable"
echo "  • Claude Desktop configuration created/updated"
echo "  • VS Code configuration example generated"
echo "  • Test environment prepared"
echo
echo "🚀 Next Steps:"
echo
echo "1. Test the server:"
echo "   ./test-mcp.js"
echo
echo "2. Start the MCP server manually:"
echo "   node mcp-server.js"
echo
echo "3. Configure your AI assistant:"
echo "   • Claude Desktop: Configuration already applied"
echo "   • VS Code: Use the generated vscode-mcp-config.json"
echo "   • Other clients: Use the configuration in mcp-config.json"
echo
echo "4. Test with an AI assistant:"
echo "   \"Analyze this calculator display\" [upload image]"
echo
echo "📚 Documentation:"
echo "   Read docs/MCP_INTEGRATION.md for detailed usage instructions"
echo
echo "🐛 Troubleshooting:"
echo "   • Check Node.js version: node --version"
echo "   • Verify dependencies: npm list @modelcontextprotocol/sdk sharp"
echo "   • Test server: ./test-mcp.js"
echo
print_status "Setup completed successfully! Happy calculating! 🧮"