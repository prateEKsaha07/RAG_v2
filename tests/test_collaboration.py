"""Tests for Collaboration module's _rpc_error mapping.

Run from project root (D:\RAG_v2):
    pytest tests/test_collaboration.py -v
"""

import pytest
from fastapi import HTTPException

from app.modules.Collaboration.service import _rpc_error


def test_already_closed_maps_to_409():
    with pytest.raises(HTTPException) as e:
        _rpc_error(Exception("{'message': 'Poll is already closed'}"))
    assert e.value.status_code == 409, e.value.detail


def test_invalid_poll_option_maps_to_400():
    with pytest.raises(HTTPException) as e:
        _rpc_error(Exception('message="Invalid poll option"'))
    assert e.value.status_code == 400, e.value.detail


def test_not_a_workspace_member_maps_to_403():
    class RpcExc(Exception):
        def __init__(self, msg):
            self.message = msg

    with pytest.raises(HTTPException) as e:
        _rpc_error(RpcExc("Not a workspace member"))
    assert e.value.status_code == 403, e.value.detail


def test_workspace_membership_not_found_maps_to_403():
    with pytest.raises(HTTPException) as e:
        _rpc_error(Exception("{'message': 'Workspace membership not found'}"))
    assert e.value.status_code == 403, e.value.detail


def test_shared_resource_not_found_maps_to_400():
    with pytest.raises(HTTPException) as e:
        _rpc_error(Exception(
            "{'message': 'Shared resource not found in this workspace'}"
        ))
    assert e.value.status_code == 400, e.value.detail


def test_conflict_detail_is_masked():
    with pytest.raises(HTTPException) as e:
        _rpc_error(Exception(
            "{'message': 'duplicate key violates constraint "
            "idx_workspace_invitation_pending'}"
        ))
    assert "constraint" not in e.value.detail
    assert "idx_workspace" not in e.value.detail
    assert e.value.status_code == 409


def test_regex_fallback_extracts_message():
    with pytest.raises(HTTPException) as e:
        _rpc_error(Exception("garbage prefix {'message': 'Task not found'} trailing"))
    assert e.value.status_code == 404, e.value.detail