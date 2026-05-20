# Project Diagrams

This folder contains Mermaid diagram sources for the term project report.

## Files

- `class_diagram.mmd`: UML-style class diagram based on the Prisma models.
- `database_er_diagram.mmd`: database ER diagram based on the PostgreSQL/Prisma schema.

## Suggested LaTeX Usage

Export the Mermaid diagrams as PNG or PDF, then include them in the report:

```latex
\begin{figure}[h]
    \centering
    \includegraphics[width=\textwidth]{figures/class_diagram.png}
    \caption{Class Diagram of the Heptapus Group Web Application}
    \label{fig:class-diagram}
\end{figure}

\begin{figure}[h]
    \centering
    \includegraphics[width=\textwidth]{figures/database_er_diagram.png}
    \caption{Database ER Diagram of the Heptapus Group Web Application}
    \label{fig:database-er-diagram}
\end{figure}
```

If Mermaid CLI is installed, export with:

```bash
mmdc -i docs/diagrams/class_diagram.mmd -o docs/diagrams/class_diagram.png
mmdc -i docs/diagrams/database_er_diagram.mmd -o docs/diagrams/database_er_diagram.png
```
