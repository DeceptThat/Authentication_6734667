import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./context/context";

const API_URL = import.meta.env.VITE_API_URL;

export default function User() {
  const { user } = useContext(UserContext);
  const isAdmin = user?._id == "-1" || user?.id == "-1";
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadUsers = async () => {
    try {
      const result = await fetch(`${API_URL}/api/user?page=1`, {
        credentials: "include",
      });
      const data = await result.json();
      if (!result.ok) {
        throw new Error(data.message || "Unable to load users");
      }
      setUsers(data.users || []);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      void Promise.resolve().then(loadUsers);
    }
  }, [isAdmin]);

  const closeDialog = () => {
    setSelectedUser(null);
    setNewPassword("");
    setConfirmPassword("");
    setFormError("");
  };

  const changePassword = async () => {
    if (newPassword.length < 8) {
      setFormError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    setIsSaving(true);
    setFormError("");
    try {
      const result = await fetch(`${API_URL}/api/user/${selectedUser._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await result.json();
      if (!result.ok) {
        throw new Error(data.message || "Unable to update password");
      }
      closeDialog();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAdmin) {
    return <Alert severity="error">Unauthorized Request</Alert>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <Typography variant="h5">User management</Typography>
          <Typography color="text.secondary">
            Manage account passwords for registered users.
          </Typography>
        </div>
      </div>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {isLoading ? (
        <CircularProgress />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b">
                <th className="p-3">Username</th>
                <th className="p-3">Email</th>
                <th className="p-3">Name</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((listedUser) => (
                <tr className="border-b" key={listedUser._id}>
                  <td className="p-3">{listedUser.username}</td>
                  <td className="p-3">{listedUser.email}</td>
                  <td className="p-3">
                    {[listedUser.firstname, listedUser.lastname]
                      .filter(Boolean)
                      .join(" ") || "-"}
                  </td>
                  <td className="p-3">{listedUser.status || "-"}</td>
                  <td className="p-3">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setSelectedUser(listedUser)}
                    >
                      Change password
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!users.length && <Typography sx={{ mt: 2 }}>No users found.</Typography>}
        </div>
      )}

      <Dialog open={Boolean(selectedUser)} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>Change password</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }} color="text.secondary">
            {selectedUser?.username} ({selectedUser?.email})
          </Typography>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="New password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={isSaving}>Cancel</Button>
          <Button onClick={changePassword} variant="contained" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save password"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
