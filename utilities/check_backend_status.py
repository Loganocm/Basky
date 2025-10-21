import requests

# Check if there's a health/actuator endpoint
print("Checking backend...")
try:
    # Try to get any info about what's running
    response = requests.get('http://localhost:8080/api/players')
    print(f"Backend is responding on port 8080")
    print(f"Status: {response.status_code}")
    
    # Now try our problematic endpoint
    response = requests.get('http://localhost:8080/api/boxscores/player/491')
    print(f"\nPlayer endpoint status: {response.status_code}")
    if response.status_code != 200:
        print(f"Error: {response.text}")
        
except Exception as e:
    print(f"Cannot connect to backend: {e}")

print("\n⚠️  If you're seeing 500 errors, the BACKEND IS RUNNING but with OLD CODE")
print("⚠️  Check the 'java' terminal - if it says 'Exit Code: 1', the backend FAILED TO START")
print("⚠️  You may need to:")
print("   1. Kill any Java processes running on port 8080")
print("   2. Run: cd baskyapp; ./mvnw clean; ./mvnw spring-boot:run")
