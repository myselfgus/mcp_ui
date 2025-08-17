import asyncio
from orchestrator.tools.fs_tools import FSApplyPatchTool, FSWriteTool, FSReadTool

PATCH = """--- a/file.txt\n+++ b/file.txt\n@@ -1,1 +1,1 @@\n-Hello\n+Hello World\n"""

async def test_apply_patch(tmp_path, monkeypatch):
    from orchestrator import config as cfg
    monkeypatch.setenv("ALLOW_FS_BASE", str(tmp_path))
    cfg.settings.allow_fs_base = str(tmp_path)

    path = tmp_path / "file.txt"
    write_tool = FSWriteTool()
    await write_tool.run(path=str(path), content="Hello\n")

    patch_tool = FSApplyPatchTool()
    await patch_tool.run(path=str(path), patch=PATCH)

    read_tool = FSReadTool()
    data = await read_tool.run(path=str(path))
    assert "World" in data["content"]

if __name__ == "__main__":
    asyncio.run(test_apply_patch(__import__('pathlib').Path('tmp'), __import__('types').SimpleNamespace()))
