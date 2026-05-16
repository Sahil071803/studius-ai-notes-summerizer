import { useEffect, useState } from "react";
import { getHistory, deleteHistory, updateHistory } from "../services/api";

import {
  Container, Typography, Card, CardContent, CircularProgress, Button, Stack,
  TextField, Pagination, Box, Chip, IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  const fetchHistory = async (p = 1) => {
    setLoading(true);
    try {
      const res = await getHistory(p, itemsPerPage);
      setHistory(res.data.data || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchHistory(page); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await deleteHistory(id);
    fetchHistory(page);
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setEditText(item.text || "");
    setEditSummary(item.summary || "");
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditText("");
    setEditSummary("");
  };

  const handleUpdate = async (id) => {
    await updateHistory(id, { text: editText, summary: editSummary });
    setEditId(null);
    fetchHistory(page);
  };

  const filtered = history.filter((item) =>
    item.text?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight={800} mb={4}>
        History
      </Typography>

      <TextField
        fullWidth
        placeholder="Search history..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        slotProps={{
          input: {
            startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
          },
        }}
        sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
      />

      {loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#7c3aed" }} />
        </Box>
      ) : filtered.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
          <Typography color="text.secondary">No history found</Typography>
        </Card>
      ) : (
        <Stack spacing={2}>
          {filtered.map((item) => (
            <Card key={item._id} sx={{ borderRadius: 4 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Chip
                    label={item.type || "summary"}
                    size="small"
                    sx={{
                      bgcolor: item.type === "quiz" ? "rgba(5,150,105,0.1)" : "rgba(124,58,237,0.1)",
                      color: item.type === "quiz" ? "#059669" : "#7c3aed",
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  />
                </Box>

                {editId === item._id ? (
                  <>
                    <TextField
                      fullWidth
                      label="Original Text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      multiline
                      rows={2}
                      size="small"
                      sx={{ mb: 1.5 }}
                    />
                    <TextField
                      fullWidth
                      label="Summary"
                      value={editSummary}
                      onChange={(e) => setEditSummary(e.target.value)}
                      multiline
                      rows={2}
                      size="small"
                    />
                    <Stack direction="row" spacing={1} mt={2}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={() => handleUpdate(item._id)}
                        size="small"
                        sx={{ bgcolor: "#7c3aed" }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<CloseIcon />}
                        onClick={handleCancelEdit}
                        size="small"
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      Original:
                    </Typography>
                    <Typography
                      sx={{
                        mb: 2,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.text}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      {item.type === "quiz" ? "Quiz:" : "Summary:"}
                    </Typography>
                    <Typography
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: item.type === "quiz" ? 1 : 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        mb: 2,
                      }}
                    >
                      {item.type === "quiz"
                        ? `${item.quiz?.length || 0} questions generated`
                        : item.summary}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(item)}
                        sx={{ color: "#7c3aed" }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(item._id)}
                        sx={{ color: "#ef4444" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {totalPages > 1 && (
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, val) => setPage(val)}
          sx={{ mt: 4, display: "flex", justifyContent: "center" }}
          color="primary"
        />
      )}
    </Container>
  );
}

export default History;
