from fastapi.testclient import TestClient
from orchestrator.api.main import app

def test_list_tools():
    client = TestClient(app)
    resp = client.get('/tools')
    assert resp.status_code == 200
    data = resp.json()
    assert 'tools' in data
    assert any(t.startswith('fs.') for t in data['tools'])
