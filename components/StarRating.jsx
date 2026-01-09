import React from 'react';

const StarRating = ({ rating, onRatingChange, readonly = false, size = 'md' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-10 h-10'
    };

    const sizeClass = sizes[size] || sizes.md;

    const renderStar = (index) => {
        const filled = index < rating;
        const isHalf = !filled && index < Math.ceil(rating) && rating % 1 !== 0;

        if (readonly) {
            return (
                <svg
                    key={index}
                    className={`${sizeClass} ${filled ? 'text-yellow-400' : isHalf ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill={filled || isHalf ? 'currentColor' : 'none'}
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                >
                    {isHalf ? (
                        <defs>
                            <linearGradient id={`half-${index}`}>
                                <stop offset='50%' stopColor='currentColor' />
                                <stop offset='50%' stopColor='#D1D5DB' stopOpacity='1' />
                            </linearGradient>
                        </defs>
                    ) : null}
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={filled ? 0 : 2}
                        fill={isHalf ? `url(#half-${index})` : filled ? 'currentColor' : 'none'}
                        d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
                    />
                </svg>
            );
        }

        return (
            <button
                key={index}
                type='button'
                onClick={() => onRatingChange(index + 1)}
                onMouseEnter={(e) => {
                    if (!readonly) {
                        const stars = e.currentTarget.parentElement.querySelectorAll('button');
                        stars.forEach((star, idx) => {
                            const svg = star.querySelector('svg');
                            if (idx <= index) {
                                svg.classList.add('text-yellow-400');
                                svg.classList.remove('text-gray-300');
                            } else {
                                svg.classList.remove('text-yellow-400');
                                svg.classList.add('text-gray-300');
                            }
                        });
                    }
                }}
                className='focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 rounded transition-transform hover:scale-110'
            >
                <svg
                    className={`${sizeClass} ${filled ? 'text-yellow-400' : 'text-gray-300'} transition-colors`}
                    fill='currentColor'
                    viewBox='0 0 24 24'
                >
                    <path d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' />
                </svg>
            </button>
        );
    };

    const handleMouseLeave = (e) => {
        if (!readonly) {
            const stars = e.currentTarget.querySelectorAll('button svg');
            stars.forEach((svg, idx) => {
                if (idx < rating) {
                    svg.classList.add('text-yellow-400');
                    svg.classList.remove('text-gray-300');
                } else {
                    svg.classList.remove('text-yellow-400');
                    svg.classList.add('text-gray-300');
                }
            });
        }
    };

    return (
        <div 
            className='flex items-center gap-1' 
            onMouseLeave={handleMouseLeave}
        >
            {[0, 1, 2, 3, 4].map((index) => renderStar(index))}
        </div>
    );
};

export default StarRating;
