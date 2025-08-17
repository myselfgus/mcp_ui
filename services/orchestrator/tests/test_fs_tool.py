import asyncio
from orchestrator.tools.fs_tools import FSWriteTool, FSReadTool

async def test_fs_write_and_read(tmp_path, monkeypatch):
    # Monkeypatch base path to temp dir
    from orchestrator import config as cfg
    monkeypatch.setenv("ALLOW_FS_BASE", str(tmp_path))
    cfg.settings.allow_fs_base = str(tmp_path)

    write_tool = FSWriteTool()
    read_tool = FSReadTool()

    await write_tool.run(path=f"{tmp_path}/file.txt", content="hello")
    data = await read_tool.run(path=f"{tmp_path}/file.txt")
    assert data["content"] == "hello"

# Run manually if needed
if __name__ == "__main__":
    asyncio.run(test_fs_write_and_read(__import__('pathlib').Path('tmp'), __import__('types').SimpleNamespace()))
