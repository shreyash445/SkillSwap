import json
import urllib.request

BASE = "http://127.0.0.1:8000/api"


def req(method, path, token=None, body=None):
    url = BASE + path
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            return resp.status, json.loads(resp.read() or b"null")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"null")


def main():
    ok = lambda s: print("PASS:", s)
    fail = lambda s: print("FAIL:", s)

    # 1. Login alice
    st, alice = req("POST", "/auth/login", body={"email": "alice.chen@student.edu", "password": "demo1234"})
    ok("alice login") if st == 200 else fail(f"login {st}")
    at, rt = alice["access"], alice["refresh"]

    # 2. Login bob
    st, bob = req("POST", "/auth/login", body={"email": "bob.davis@student.edu", "password": "demo1234"})
    bt = bob["access"]

    # 3. me
    st, me = req("GET", "/auth/me", token=at)
    ok(f"me = {me['full_name']} offers={len(me['offers'])} wants={len(me['wants'])}") if st == 200 else fail("me")

    # 4. discovery with match sort
    st, users = req("GET", "/users?sort=match", token=at)
    top = [u for u in users if u["match_score"] and u["match_score"] >= 50]
    ok(f"discovery {len(users)} users, {len(top)} strong matches, top={top[0]['full_name']}") if st == 200 else fail("users")

    # 5. propose exchange to bob
    bob_id = next(u["id"] for u in users if u["email"] == "bob.davis@student.edu")
    st, ex = req("POST", "/exchanges", token=at, body={
        "recipient_id": bob_id, "skill_offered_id": 1, "skill_wanted_id": 39,
        "proposed_duration": 60, "proposed_date": "2026-08-22", "message": "Python for guitar?"
    })
    ok(f"propose {st} id={ex.get('id')} status={ex.get('status')}") if st == 201 else fail(f"propose {st} {ex}")
    exid = ex["id"]

    # 6. bob accepts
    st, ex2 = req("PATCH", f"/exchanges/{exid}", token=bt, body={"action": "accept"})
    ok(f"accept -> {ex2.get('status')}") if st == 200 and ex2["status"] == "accepted" else fail(f"accept {st}")

    # 7. messages bob -> alice
    st, msg = req("POST", f"/exchanges/{exid}/messages", token=bt, body={"content": "Sounds good! 6pm?"})
    ok(f"send msg -> {msg.get('content')}") if st == 201 else fail(f"msg {st}")
    st, msgs = req("GET", f"/exchanges/{exid}/messages", token=at)
    ok(f"alice reads {len(msgs)} msg(s) from {msgs[0]['sender_name']}") if st == 200 and len(msgs) == 1 else fail("msgs")

    # 8. notifications
    st, notif = req("GET", "/notifications", token=bt)
    ok(f"bob notifs: {notif}") if st == 200 and notif["unread_messages"] >= 0 else fail("notif")

    # 9. complete (by bob, who accepted)
    st, ex3 = req("PATCH", f"/exchanges/{exid}", token=bt, body={"action": "complete"})
    ok(f"complete -> {ex3.get('status')}") if st == 200 and ex3["status"] == "completed" else fail(f"complete {st}")

    # 10. rate (alice rates bob)
    st, rating = req("POST", f"/exchanges/{exid}/rate", token=at, body={"stars": 5, "feedback": "Bob is amazing!"})
    ok(f"rating {rating.get('stars')}* by {rating.get('rater_name')}") if st == 201 else fail(f"rate {st} {rating}")

    # 11. bob's rating stats updated
    st, me2 = req("GET", "/auth/me", token=bt)
    ok(f"bob avg={me2['avg_rating']} count={me2['rating_count']}") if me2["rating_count"] >= 1 else fail("stats")

    # 12. leaderboard
    st, lb = req("GET", "/leaderboard", token=at)
    ok(f"leaderboard top: {lb[0]['user']['full_name']} {lb[0]['avg_rating']}*") if st == 200 else fail("lb")

    # 13. register accepts any personal email
    st, err = req("POST", "/auth/register", body={"email": "hacker@gmail.com", "password": "password123", "first_name": "X"})
    ok(f"personal email accepted ({st})") if 200 <= st < 300 else fail(f"personal email rejected? {st}")

    # 14. logout
    st, _ = req("POST", "/auth/logout", token=at, body={"refresh": rt})
    ok(f"logout {st}") if st == 204 else fail(f"logout {st}")


if __name__ == "__main__":
    main()