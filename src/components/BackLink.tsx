import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Link } from "react-router-dom";

type BackLinkProps = {
  to: string;
  label: string;
};

export function BackLink({ to, label }: BackLinkProps) {
  return (
    <Link className="button-link button-link-secondary button-small" to={to}>
      <ArrowBackRoundedIcon fontSize="small" />
      {label}
    </Link>
  );
}
