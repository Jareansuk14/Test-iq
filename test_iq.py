# -*- coding: utf-8 -*-
import sys
import io
import json
import os
from datetime import datetime, timedelta
import time

# UTF-8 support
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

try:
    from iqoptionapi.stable_api import IQ_Option
except ImportError:
    print(json.dumps({"error": "❌ iqoptionapi not installed"}, ensure_ascii=False))
    sys.exit(1)

def main():
    try:
        if len(sys.argv) < 3:
            print(json.dumps({"error": "❌ Usage: python test_iq.py SYMBOL TIME"}, ensure_ascii=False))
            sys.exit(1)
        
        symbol = sys.argv[1]  # BTCUSD
        target_time = sys.argv[2]  # 20:00
        
        # Credentials
        USERNAME = os.getenv('IQ_USERNAME', 'gerbera.ville@gmail.com')
        PASSWORD = os.getenv('IQ_PASSWORD', 'Thefinal14')
        
        print(f"🔗 Connecting to IQ Option as {USERNAME}", file=sys.stderr)
        print(f"📊 Target: {symbol} at {target_time}", file=sys.stderr)
        
        # Connect
        iq = IQ_Option(USERNAME, PASSWORD)
        print("📡 Connecting...", file=sys.stderr)
        
        iq.connect()
        print("✅ Connected!", file=sys.stderr)
        
        if not iq.check_connect():
            print(json.dumps({"error": "❌ Connection failed"}, ensure_ascii=False))
            sys.exit(1)
        
        print("🎯 Switching to PRACTICE account", file=sys.stderr)
        iq.change_balance("PRACTICE")
        
        # Calculate target timestamp for today at target_time
        hours, minutes = map(int, target_time.split(':'))
        now = datetime.now()
        target_datetime = now.replace(hour=hours, minute=minutes, second=0, microsecond=0)
        
        # If time has passed, use yesterday's data
        if target_datetime > now:
            target_datetime = target_datetime - timedelta(days=1)
        
        target_timestamp = int(time.mktime(target_datetime.timetuple()))
        
        print(f"🕐 Target timestamp: {target_timestamp}", file=sys.stderr)
        print(f"📅 Target datetime: {target_datetime}", file=sys.stderr)
        
        # Get candles
        print("📈 Getting candles...", file=sys.stderr)
        candles = iq.get_candles(symbol, 300, 50, target_timestamp)  # 5min candles
        
        if not candles:
            print(json.dumps({"error": "❌ No candles data"}, ensure_ascii=False))
            sys.exit(1)
        
        print(f"📊 Retrieved {len(candles)} candles", file=sys.stderr)
        
        # Find exact or closest candle
        target_candle = None
        for candle in candles:
            if candle['from'] == target_timestamp:
                target_candle = candle
                break
        
        if not target_candle:
            # Find closest
            target_candle = min(candles, key=lambda x: abs(x['from'] - target_timestamp))
            print("⚠️ Using closest candle", file=sys.stderr)
        
        # Analyze
        open_price = target_candle['open']
        close_price = target_candle['close']
        
        if close_price > open_price:
            color = "green"
        elif close_price < open_price:
            color = "red"
        else:
            color = "doji"
        
        candle_time = datetime.fromtimestamp(target_candle['from'])
        
        result = {
            "success": True,
            "symbol": symbol,
            "time": candle_time.strftime("%H:%M"),
            "date": candle_time.strftime("%Y-%m-%d"),
            "open": round(open_price, 2),
            "close": round(close_price, 2),
            "color": color,
            "volume": target_candle.get('volume', 0),
            "timestamp": target_candle['from']
        }
        
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        print(json.dumps({
            "error": f"❌ {str(e)}",
            "type": type(e).__name__
        }, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main()