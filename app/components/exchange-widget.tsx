"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpDown, Settings, ArrowLeftRight, Fuel, MessageSquare } from "lucide-react"

export function ExchangeWidget() {
  const [activeTab, setActiveTab] = useState("exchange")

  return (
    <div className="flex items-start gap-4">
      {/* Sidebar */}
      <div className="flex flex-col gap-2">
        <Button
          variant={activeTab === "exchange" ? "default" : "ghost"}
          size="icon"
          className={`w-12 h-12 rounded-xl ${
            activeTab === "exchange"
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-gray-800/50 hover:bg-gray-700/50 text-gray-400"
          }`}
          onClick={() => setActiveTab("exchange")}
        >
          <ArrowLeftRight className="h-5 w-5" />
        </Button>
        <Button
          variant={activeTab === "gas" ? "default" : "ghost"}
          size="icon"
          className={`w-12 h-12 rounded-xl ${
            activeTab === "gas"
              ? "bg-gray-700 hover:bg-gray-600 text-white"
              : "bg-gray-800/50 hover:bg-gray-700/50 text-gray-400"
          }`}
          onClick={() => setActiveTab("gas")}
        >
          <Fuel className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Exchange Widget */}
      <Card className="w-[400px] bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold text-white">
            {activeTab === "exchange" ? "Exchange" : "Gas"}
          </CardTitle>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
            <Settings className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeTab === "exchange" ? (
            <>
              {/* From Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">From</label>
                <Button
                  variant="outline"
                  className="w-full h-16 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 justify-start text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                    </div>
                    <span className="text-gray-400">Select chain and token</span>
                  </div>
                </Button>
              </div>

              {/* Swap Arrow */}
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>

              {/* To Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">To</label>
                <Button
                  variant="outline"
                  className="w-full h-16 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 justify-start text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                    </div>
                    <span className="text-gray-400">Select chain and token</span>
                  </div>
                </Button>
              </div>

              {/* Send Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Send</label>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-semibold text-white">0</div>
                      <div className="text-sm text-gray-400">$0.00</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Gas Station Content */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Chain</label>
                <Button
                  variant="outline"
                  className="w-full h-16 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 justify-start text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                    </div>
                    <span className="text-gray-400">Select chain</span>
                  </div>
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Gas Amount</label>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <Fuel className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-semibold text-white">0</div>
                      <div className="text-sm text-gray-400">$0.00</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white h-12 rounded-xl font-medium">
              Connect wallet
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 text-gray-400 hover:text-white rounded-xl"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
