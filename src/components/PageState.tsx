import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

type LoadingStateProps = {
  label: string;
};

type ErrorBannerProps = {
  message: string;
};

type SuccessBannerProps = {
  message: string;
};

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <div className="page-loading-state" role="status" aria-live="polite">
      <CircularProgress size={22} thickness={4} />
      <span>{label}</span>
    </div>
  );
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="page-error-banner" role="alert">
      <ErrorOutlineRoundedIcon fontSize="small" />
      <span>{message}</span>
    </div>
  );
}

export function SuccessBanner({ message }: SuccessBannerProps) {
  return (
    <div className="page-success-banner" role="status">
      <CheckCircleOutlineRoundedIcon fontSize="small" />
      <span>{message}</span>
    </div>
  );
}
