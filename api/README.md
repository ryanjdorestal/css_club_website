# api

`index.py` is the one Vercel function and only assembles routers. `_core/` is the app — start at `store.py` (the one read/write path), `auth.py` (roles), `crud.py` (the generic router), then `routers/`. Tests: `pytest` (44). Never add a top-level file here.
