import json
import time
from typing import Dict, List, Any
from datetime import datetime

class MCPRegistry:
    """
    Centralized MCP Tool Server Registry.
    Tracks all FastMCP tools, servers, and available endpoints.
    Auto-indexes tools when new agents are forged.
    """
    
    def __init__(self):
        self.registry: Dict[str, Any] = {}
        self.tool_index: Dict[str, List[str]] = {}
        self._init_seed_tools()
    
    def _init_seed_tools(self):
        """Initialize registry with pre-built MCP tool servers."""
        seed_servers = [
            {
                "id": "crypto_sentinel",
                "name": "CryptoSentinel MCP Server",
                "description": "FastMCP tool server for real-time crypto price tracking via CoinGecko API",
                "transport": "stdio",
                "tools": [
                    {
                        "name": "get_crypto_price",
                        "signature": "get_crypto_price(symbol: str = 'bitcoin') -> dict",
                        "description": "Fetches real-time price in USD, 24h change, and volume."
                    },
                    {
                        "name": "send_alert",
                        "signature": "send_alert(target: str, message: str) -> bool",
                        "description": "Sends webhook or log notification when threshold is breached."
                    }
                ],
                "timestamp": datetime.now().isoformat(),
                "version": "1.0.0",
                "category": "pre_built"
            },
            {
                "id": "weather_advisor",
                "name": "WeatherAdvisor MCP Server",
                "description": "Provides live meteorological data and outfit decision heuristics",
                "transport": "stdio",
                "tools": [
                    {
                        "name": "fetch_city_weather",
                        "signature": "fetch_city_weather(city: str) -> dict",
                        "description": "Retrieves current temperature (°C), humidity, and precipitation."
                    },
                    {
                        "name": "recommend_attire",
                        "signature": "recommend_attire(temp_c: float, rain: bool) -> str",
                        "description": "Determines umbrella & clothing recommendations."
                    }
                ],
                "timestamp": datetime.now().isoformat(),
                "version": "1.0.0",
                "category": "pre_built"
            },
            {
                "id": "hn_scraper",
                "name": "HN Scraper MCP Server",
                "description": "Scrapes frontpage technical articles from Hacker News",
                "transport": "http",
                "tools": [
                    {
                        "name": "fetch_hn_top3",
                        "signature": "fetch_hn_top3() -> list",
                        "description": "Returns top 3 story titles, URLs, score, and comment count."
                    },
                    {
                        "name": "summarize_article",
                        "signature": "summarize_article(url: str) -> str",
                        "description": "Fetches raw article body text for RAG indexing."
                    }
                ],
                "timestamp": datetime.now().isoformat(),
                "version": "1.0.0",
                "category": "pre_built"
            }
        ]
        
        for server in seed_servers:
            self.register_server(server)
        
        print(f"[OK] [MCP Registry] Seeded {len(seed_servers)} pre-built tool servers")
    
    def register_server(self, server_info: Dict[str, Any]) -> bool:
        """
        Register a new MCP tool server in the registry.
        Called when a new agent is forged.
        """
        server_id = server_info.get("id", f"agent_{int(time.time())}")
        
        self.registry[server_id] = {
            "id": server_id,
            "name": server_info.get("name", "Unnamed Server"),
            "description": server_info.get("description", ""),
            "transport": server_info.get("transport", "stdio"),
            "tools": server_info.get("tools", []),
            "timestamp": server_info.get("timestamp", datetime.now().isoformat()),
            "version": server_info.get("version", "1.0.0"),
            "category": server_info.get("category", "user_forged"),
            "prompt": server_info.get("prompt", "")
        }
        
        # Index tools for quick lookup
        for tool in server_info.get("tools", []):
            tool_name = tool.get("name", "unknown")
            if tool_name not in self.tool_index:
                self.tool_index[tool_name] = []
            self.tool_index[tool_name].append(server_id)
        
        return True
    
    def list_all_servers(self) -> List[Dict[str, Any]]:
        """Get all registered MCP tool servers."""
        return list(self.registry.values())
    
    def list_servers_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Filter servers by category (pre_built, user_forged)."""
        return [s for s in self.registry.values() if s.get("category") == category]
    
    def get_server(self, server_id: str) -> Dict[str, Any] | None:
        """Get specific MCP server details."""
        return self.registry.get(server_id)
    
    def find_tool(self, tool_name: str) -> List[Dict[str, Any]]:
        """Find which servers provide a specific tool."""
        server_ids = self.tool_index.get(tool_name, [])
        results = []
        for sid in server_ids:
            server = self.registry.get(sid)
            if server:
                tool = next((t for t in server["tools"] if t["name"] == tool_name), None)
                if tool:
                    results.append({
                        "tool": tool,
                        "server_id": sid,
                        "server_name": server["name"]
                    })
        return results
    
    def search_tools(self, query: str) -> List[Dict[str, Any]]:
        """Search tools by name or description."""
        query_lower = query.lower()
        results = []
        
        for server_id, server in self.registry.items():
            for tool in server["tools"]:
                tool_name = tool.get("name", "").lower()
                tool_desc = tool.get("description", "").lower()
                
                if query_lower in tool_name or query_lower in tool_desc:
                    results.append({
                        "tool": tool,
                        "server_id": server_id,
                        "server_name": server["name"],
                        "category": server["category"]
                    })
        
        return results
    
    def get_stats(self) -> Dict[str, Any]:
        """Get registry statistics."""
        total_servers = len(self.registry)
        pre_built = sum(1 for s in self.registry.values() if s["category"] == "pre_built")
        user_forged = total_servers - pre_built
        total_tools = sum(len(s["tools"]) for s in self.registry.values())
        
        return {
            "total_servers": total_servers,
            "pre_built_servers": pre_built,
            "user_forged_servers": user_forged,
            "total_tools": total_tools,
            "tool_categories": list(set(t for tools in [s["tools"] for s in self.registry.values()] for t in [self._categorize_tool(tool["name"]) for tool in tools]))
        }
    
    def _categorize_tool(self, tool_name: str) -> str:
        """Auto-categorize tool by name patterns."""
        name_lower = tool_name.lower()
        if any(k in name_lower for k in ["price", "crypto", "finance", "stock", "btc"]):
            return "financial"
        elif any(k in name_lower for k in ["weather", "temp", "forecast", "geo", "location"]):
            return "weather"
        elif any(k in name_lower for k in ["news", "article", "scrape", "fetch", "html"]):
            return "news_scraper"
        elif any(k in name_lower for k in ["alert", "notify", "email", "dispatch", "webhook"]):
            return "notification"
        elif any(k in name_lower for k in ["execute", "run", "call", "invoke", "process"]):
            return "execution"
        else:
            return "general"
    
    def export_registry(self) -> str:
        """Export registry as JSON for API responses."""
        return json.dumps({
            "servers": self.list_all_servers(),
            "stats": self.get_stats(),
            "timestamp": datetime.now().isoformat()
        }, indent=2)
    
    def export_tool_catalog(self) -> Dict[str, Any]:
        """Export tool catalog grouped by category."""
        catalog = {}
        for server in self.registry.values():
            for tool in server["tools"]:
                category = self._categorize_tool(tool["name"])
                if category not in catalog:
                    catalog[category] = []
                
                catalog[category].append({
                    "name": tool["name"],
                    "signature": tool["signature"],
                    "description": tool["description"],
                    "server": server["name"],
                    "server_id": server["id"]
                })
        
        return catalog


# Global MCP Registry Instance
mcp_registry = MCPRegistry()
