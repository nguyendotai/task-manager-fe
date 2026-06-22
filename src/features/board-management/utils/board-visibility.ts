import type { Board, BoardAllowedMember } from "@/modules/boards/types";

export function getBoardVisibility(board: Board) {
  return board.visibility ?? "PUBLIC";
}

export function getAllowedMemberId(member: BoardAllowedMember) {
  if (typeof member === "string") {
    return member;
  }

  return member.id ?? member._id ?? "";
}

export function getAllowedMemberIds(board: Board) {
  return (board.allowedMembers ?? [])
    .map(getAllowedMemberId)
    .filter(Boolean);
}

export function getAllowedMembersCount(board: Board) {
  return getAllowedMemberIds(board).length;
}

export function isPrivateBoard(board: Board) {
  return getBoardVisibility(board) === "PRIVATE";
}
